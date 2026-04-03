const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

const targets = [
  'node_modules/@ant-design/pro-form/es/layouts/ModalForm/index.js',
  'node_modules/@ant-design/pro-form/es/layouts/DrawerForm/index.js',
  'node_modules/@ant-design/pro-form/lib/layouts/ModalForm/index.js',
  'node_modules/@ant-design/pro-form/lib/layouts/DrawerForm/index.js',
];

const modalCompatExpr =
  '(modalProps === null || modalProps === void 0 ? void 0 : modalProps.destroyOnHidden) || (modalProps === null || modalProps === void 0 ? void 0 : modalProps.destroyOnClose)';
const drawerCompatExpr =
  '(drawerProps === null || drawerProps === void 0 ? void 0 : drawerProps.destroyOnHidden) || (drawerProps === null || drawerProps === void 0 ? void 0 : drawerProps.destroyOnClose)';

let changedFiles = 0;

for (const rel of targets) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    continue;
  }

  const source = fs.readFileSync(abs, 'utf8');
  let next = source;

  // ModalForm: old -> compat
  next = next.replaceAll(
    'if (form && modalProps !== null && modalProps !== void 0 && modalProps.destroyOnClose) {',
    `if (form && (${modalCompatExpr})) {`,
  );
  next = next.replaceAll(
    '}, [modalProps === null || modalProps === void 0 ? void 0 : modalProps.destroyOnClose, rest.form, rest.formRef]);',
    `}, [${modalCompatExpr}, rest.form, rest.formRef]);`,
  );

  // DrawerForm: old -> compat
  next = next.replaceAll(
    'if (form && drawerProps !== null && drawerProps !== void 0 && drawerProps.destroyOnClose) {',
    `if (form && (${drawerCompatExpr})) {`,
  );
  next = next.replaceAll(
    '}, [drawerProps === null || drawerProps === void 0 ? void 0 : drawerProps.destroyOnClose, rest.form, rest.formRef]);',
    `}, [${drawerCompatExpr}, rest.form, rest.formRef]);`,
  );

  // Fix for previously patched precedence (safe re-run)
  next = next.replaceAll(
    `if (form && modalProps !== null && modalProps !== void 0 && ${modalCompatExpr}) {`,
    `if (form && (${modalCompatExpr})) {`,
  );
  next = next.replaceAll(
    `if (form && modalProps !== null && modalProps !== void 0 && ${modalCompatExpr.replace(
      'destroyOnHidden) || (modalProps',
      'destroyOnHidden) || (modalProps',
    )}) {`,
    `if (form && (${modalCompatExpr})) {`,
  );
  next = next.replaceAll(
    `if (form && drawerProps !== null && drawerProps !== void 0 && ${drawerCompatExpr}) {`,
    `if (form && (${drawerCompatExpr})) {`,
  );
  next = next.replaceAll(
    `}, [modalProps === null || modalProps === void 0 ? void 0 : ${modalCompatExpr}, rest.form, rest.formRef]);`,
    `}, [${modalCompatExpr}, rest.form, rest.formRef]);`,
  );
  next = next.replaceAll(
    `}, [drawerProps === null || drawerProps === void 0 ? void 0 : ${drawerCompatExpr}, rest.form, rest.formRef]);`,
    `}, [${drawerCompatExpr}, rest.form, rest.formRef]);`,
  );

  if (next !== source) {
    fs.writeFileSync(abs, next, 'utf8');
    changedFiles += 1;
  }
}

console.log(
  `[patch-pro-form-modal-deprecation] patched files: ${changedFiles}`,
);
