const fs = require('node:fs');
const path = require('node:path');

const projectRoot = process.cwd();
const stockModelRoot = path.resolve(
  projectRoot,
  '../stock-mgr/stock-common/src/main/java/co/handk/common/model',
);
const voDir = path.join(stockModelRoot, 'vo');
const queryDir = path.join(stockModelRoot, 'dto/query');

const resources = [
  'brand',
  'series',
  'maker',
  'goodsType',
  'goods',
  'warehouse',
  'customerLevel',
  'customer',
  'dept',
  'stock',
  'stockRecord',
  'stockOrder',
  'stockOrderItem',
  'priceRecord',
  'requestForm',
  'requestItem',
  'message',
  'user',
  'role',
  'permission',
  'userRole',
  'rolePermission',
  'userToken',
  'config',
  'operateLog',
];

const voOverrides = {
  stock: 'StockPageVO',
};

const typeMap = {
  String: 'String',
  Integer: 'Integer',
  Long: 'Long',
  BigDecimal: 'BigDecimal',
  LocalDateTime: 'LocalDateTime',
  StatusEnum: 'Integer',
  Boolean: 'Integer',
  int: 'Integer',
  long: 'Long',
};

const toPascal = (resource) =>
  resource.replace(
    /(^|[A-Z])([a-z])/g,
    (_, p1, p2) => `${p1.toUpperCase()}${p2}`,
  );

const parseFields = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const source = fs.readFileSync(filePath, 'utf8');
  const fieldRegex = /private\s+([A-Za-z0-9_$.<>]+)\s+([A-Za-z0-9_]+)\s*;/g;
  const fields = [];
  let match = fieldRegex.exec(source);
  while (match) {
    const rawType = match[1].split('.').pop().replace(/<.*>/, '');
    const name = match[2];
    fields.push({
      name,
      type: typeMap[rawType] || 'String',
    });
    match = fieldRegex.exec(source);
  }
  return fields;
};

const dedupeFields = (fields) => {
  const seen = new Set();
  const output = [];
  fields.forEach((field) => {
    if (seen.has(field.name)) {
      return;
    }
    seen.add(field.name);
    output.push(field);
  });
  return output;
};

const baseVoFields = parseFields(path.join(voDir, 'BaseVO.java'));
const schema = {};

resources.forEach((resource) => {
  const pascal = toPascal(resource);
  const voClassName = voOverrides[resource] || `${pascal}VO`;
  const queryClassName = `${pascal}QueryDTO`;
  const voFields = parseFields(path.join(voDir, `${voClassName}.java`));
  const queryFields = parseFields(
    path.join(queryDir, `${queryClassName}.java`),
  );

  schema[resource] = {
    tableFields: dedupeFields([...baseVoFields, ...voFields]),
    searchFields: queryFields,
  };
});

const outputPath = path.join(projectRoot, 'src/config/crudResourceSchema.ts');
const output = `import type { CrudField } from './crudModules';

export interface CrudResourceSchema {
  tableFields: CrudField[];
  searchFields: CrudField[];
}

export const CRUD_RESOURCE_SCHEMA_MAP: Record<string, CrudResourceSchema> = ${JSON.stringify(
  schema,
  null,
  2,
)};
`;

fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Generated ${outputPath}`);
