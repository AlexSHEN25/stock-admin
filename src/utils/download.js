import { getStoredToken } from '../api/http';

const SAVE_PICKER_UNSUPPORTED_MESSAGE = '\u5f53\u524d\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u9009\u62e9\u4fdd\u5b58\u8def\u5f84\u3002\u8bf7\u4f7f\u7528 Chrome/Edge\uff0c\u6216\u5728\u6d4f\u89c8\u5668\u8bbe\u7f6e\u4e2d\u542f\u7528\u201c\u4e0b\u8f7d\u524d\u8be2\u95ee\u4fdd\u5b58\u4f4d\u7f6e\u201d\u3002';

const DOWNLOAD_MESSAGES = {
  authExpired: 'ログインの有効期限が切れました',
  failed: (status) => `ダウンロードに失敗しました（${status}）`,
};

export async function downloadRequestFormFile(recordId, fallbackMessage, format = 'excel', options = {}) {
  if (!recordId) return;

  const token = getStoredToken();
  if (!token) {
    notifyAuthExpired();
  }

  const saveHandle = options.promptSavePath
    ? await pickSaveFile(options.suggestedFileName || defaultRequestFormFileName(recordId, format))
    : null;
  if (saveHandle?.aborted) return;
  if (options.promptSavePath && !saveHandle?.handle) {
    throw new Error(SAVE_PICKER_UNSUPPORTED_MESSAGE);
  }

  const response = await requestWithFallback(recordId, token, format);
  if (!response.ok) {
    throw new Error(`${fallbackMessage} (${response.status})`);
  }

  await saveResponseFile(response, recordId, saveHandle?.handle);
}

export async function downloadRequestFormPdf(recordId, fallbackMessage, options = {}) {
  return downloadRequestFormFile(recordId, fallbackMessage, 'pdf', options);
}

export async function downloadFileByUrl(url, fallbackFileName, params = null) {
  const token = getStoredToken();
  if (!token) {
    notifyAuthExpired();
  }

  const response = await requestDownload(buildDownloadUrl(url, params), token);
  if (!response.ok) {
    throw new Error(DOWNLOAD_MESSAGES.failed(response.status));
  }

  await saveResponseFile(response, fallbackFileName);
}

function notifyAuthExpired() {
  window.dispatchEvent(new CustomEvent('auth-expired'));
  throw new Error(DOWNLOAD_MESSAGES.authExpired);
}

function buildDownloadUrl(url, params) {
  if (!params || typeof params !== 'object') return url;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || String(value).trim() === '') return;
    query.append(key, value);
  });
  const queryString = query.toString();
  if (!queryString) return url;
  return `${url}${String(url).includes('?') ? '&' : '?'}${queryString}`;
}

async function saveResponseFile(response, fallbackFileName, saveHandle = null) {
  const blob = await response.blob();
  const fileName = resolveDownloadFileName(response, fallbackFileName);
  if (saveHandle) {
    await writeBlobToHandle(saveHandle, blob);
    return;
  }

  const saved = await saveByFilePicker(blob, fileName);
  if (saved) return;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

async function requestDownload(url, token) {
  return fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Accept-Language': 'ja-JP',
      'X-Lang': 'ja-JP',
    },
  });
}

async function requestWithFallback(recordId, token, format) {
  const safeFormat = String(format || 'excel').toLowerCase();
  const candidates = safeFormat === 'pdf'
    ? [
      `/api/requestForm/${recordId}/pdf`,
      `/api/requestForm/${recordId}/download?format=pdf`,
      `/api/requestForm/download/${recordId}?format=pdf`,
    ]
    : [
      `/api/requestForm/${recordId}/download?format=excel`,
      `/api/requestForm/download/${recordId}`,
      `/api/requestForm/${recordId}/download`,
    ];

  let last = await requestDownload(candidates[0], token);
  for (let i = 1; i < candidates.length && !last.ok; i += 1) {
    last = await requestDownload(candidates[i], token);
  }
  return last;
}

async function saveByFilePicker(blob, fileName) {
  const picked = await pickSaveFile(fileName);
  if (!picked?.handle) return Boolean(picked?.aborted);
  await writeBlobToHandle(picked.handle, blob);
  return true;
}

async function pickSaveFile(fileName) {
  if (typeof window.showSaveFilePicker !== 'function') return false;
  const options = {
    suggestedName: fileName,
    types: downloadFileTypes(fileName),
  };
  try {
    const handle = await window.showSaveFilePicker(options);
    return { handle };
  } catch (error) {
    return error?.name === 'AbortError' ? { aborted: true } : false;
  }
}

function downloadFileTypes(fileName) {
  const lower = String(fileName || '').toLowerCase();
  if (lower.endsWith('.pdf')) {
    return [
      {
        description: 'PDF',
        accept: {
          'application/pdf': ['.pdf'],
        },
      },
    ];
  }
  if (lower.endsWith('.xlsx')) {
    return [
      {
        description: 'Excel',
        accept: {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
      },
    ];
  }
  return [];
}

async function writeBlobToHandle(handle, blob) {
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

function defaultRequestFormFileName(recordId, format = 'excel') {
  const suffix = String(format || '').toLowerCase() === 'pdf' ? 'pdf' : 'xlsx';
  return `request_${recordId}.${suffix}`;
}

function resolveDownloadFileName(response, fallbackName) {
  const fallback = fallbackFileName(response, fallbackName);
  const disposition = response.headers.get('content-disposition') || '';
  if (!disposition) return fallback;

  const encodedMatch = disposition.match(/filename\*\s*=\s*([^;]+)/i);
  if (encodedMatch?.[1]) {
    const raw = encodedMatch[1].trim().replace(/^["']|["']$/g, '');
    const encoded = raw.includes("''") ? raw.split("''").slice(1).join("''") : raw;
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded || fallback;
    }
  }

  const plainMatch = disposition.match(/filename\s*=\s*([^;]+)/i);
  if (plainMatch?.[1]) {
    const raw = plainMatch[1].trim().replace(/^["']|["']$/g, '');
    return raw || fallback;
  }

  return fallback;
}

function fallbackFileName(response, fallbackName) {
  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  const raw = String(fallbackName || '').trim();
  if (raw) return raw;
  if (contentType.includes('pdf')) return 'ダウンロード.pdf';
  return 'ダウンロード.xlsx';
}

