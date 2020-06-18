import isEqual from 'lodash/isEqual';

type InvalidField = {
  fieldPath: string,
  value: any
}

function diffField(
  {internalFieldPath, internalValue}: { internalFieldPath: string, internalValue: any },
  {externalFieldPath, externalValue}: { externalFieldPath: string, externalValue: any },
  result: InvalidField[]
) {
  if (externalValue === internalValue) {
    return;
  }

  // should check array first
  if (Array.isArray(externalValue) && Array.isArray(internalValue)) {
    externalValue.forEach((externalItem, index) => {
      if (!internalValue.some(internalItem => isEqual(internalItem, externalItem))) {
        result.push({
          fieldPath: `${externalFieldPath}[${index}]`,
          value: externalItem
        });
      }
    })
    return;
  }

  // object
  if (typeof externalValue === 'object' && typeof internalValue === 'object') {
    for (const externalKey in externalValue) {
      diffField({
        internalFieldPath: `${internalFieldPath}.${externalKey}`,
        internalValue: internalValue[externalKey]
      }, {
        externalFieldPath: `${externalFieldPath}.${externalKey}`,
        externalValue: externalValue[externalKey]
      }, result);
    }
    return;
  }


  result.push({
    fieldPath: externalFieldPath,
    value: externalValue
  });
}

function findUnhandledFields(internal: { [key: string]: any }, external: { [key: string]: any }): InvalidField[] {
  const result: InvalidField[] = [];
  diffField({
    internalFieldPath: 'root',
    internalValue: internal,
  }, {
    externalFieldPath: 'root',
    externalValue: external
  }, result);
  return result;
}

const internal = {
  aaa: 111,
  bbb: [111, 222],
  ccc: {
    c11: 11,
    c22: 22
  },
  ddd: [
    {aaa: 111},
    {aaa: 222}
  ]
}
const external = {
  aaa: 222,
  bbb: [222, 333],
  ccc: {
    c11: 11,
    c33: 33
  },
  ddd: [
    {bbb: 111},
    {aaa: 222}
  ]
}

const unhandledFields = findUnhandledFields(internal, external)
console.log('### unhandledFields', unhandledFields);
