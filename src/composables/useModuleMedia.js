export function useModuleMedia(options) {
  const {
    moduleKey,
    formState,
    editState,
    inlineField,
    uploadFileByBizType,
    notify,
  } = options;

  function isAvatarField(field) {
    const key = String(field || '').toLowerCase();
    if (key === 'avatar' || key === 'avatarurl') return true;
    return moduleKey.value === 'brand' && (key === 'image' || key === 'imageurl');
  }

  function resolveAvatarSrc(record) {
    const raw = String(record?.avatar || record?.avatarUrl || record?.image || record?.imageUrl || '').trim();
    if (!raw) return '';
    if (raw.startsWith('data:') || raw.startsWith('blob:') || raw.startsWith('/') || /^https?:\/\//i.test(raw)) {
      return raw;
    }
    return `/${raw}`;
  }

  function beforeAvatarUpload(field, file) {
    return beforeImageUpload(formState, field, file);
  }

  function beforeInlineAvatarUpload(field, file) {
    return beforeImageUpload(editState, inlineField(field), file);
  }

  function beforeImageUpload(target, field, file) {
    if (moduleKey.value === 'brand' && isAvatarField(field)) {
      uploadImageToBackend('BRAND', file, target[field], (url) => {
        target[field] = url;
      });
      return false;
    }
    if (moduleKey.value === 'user' && isAvatarField(field)) {
      uploadImageToBackend('AVATAR', file, target[field], (url) => {
        target[field] = url;
      });
      return false;
    }
    setImageFieldFromFile(target, field, file);
    return false;
  }

  async function uploadImageToBackend(bizType, file, oldPath, onSuccess) {
    const isAvatar = bizType === 'AVATAR';
    try {
      const imagePath = await uploadFileByBizType(bizType, file, oldPath);
      if (!imagePath) {
        notify.error('画像アップロードに失敗しました');
        return;
      }
      onSuccess(String(imagePath));
      notify.success(isAvatar ? 'アバターをアップロードしました' : '画像をアップロードしました');
    } catch (error) {
      notify.error(error?.message || (isAvatar ? 'アバターのアップロードに失敗しました' : '画像アップロードに失敗しました'));
    }
  }

  function setImageFieldFromFile(target, field, file) {
    const reader = new FileReader();
    reader.onload = () => {
      target[field] = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }

  return {
    isAvatarField,
    resolveAvatarSrc,
    beforeAvatarUpload,
    beforeInlineAvatarUpload,
  };
}
