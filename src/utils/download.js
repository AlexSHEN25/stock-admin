import { TOKEN_KEY } from '../api/http';

export async function downloadRequestFormFile(recordId, fallbackMessage) {
  if (!recordId) return;

  const token = localStorage.getItem(TOKEN_KEY) || '';
  let response = await requestDownload(`/api/requestForm/download/${recordId}`, token);
  if (!response.ok) {
    response = await requestDownload(`/api/requestForm/${recordId}/download`, token);
  }
  if (!response.ok) {
    throw new Error(`${fallbackMessage}(${response.status})`);
  }

  const blob = await response.blob();
  const fileName = resolveDownloadFileName(response, recordId);
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

async function saveByFilePicker(blob, fileName) {
  if (typeof window.showSaveFilePicker !== 'function') return false;
  const options = {
    suggestedName: fileName,
    types: fileName.toLowerCase().endsWith('.xlsx')
      ? [
        {
          description: 'Excel',
          accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          },
        },
      ]
      : [],
  };
  try {
    const handle = await window.showSaveFilePicker(options);
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (error) {
    return error?.name === 'AbortError';
  }
}

function resolveDownloadFileName(response, recordId) {
  const fallback = `request_${recordId}.xlsx`;
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
