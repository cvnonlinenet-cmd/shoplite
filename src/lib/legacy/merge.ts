// Gộp cấu hình từ JSON người dùng gửi lên. CỐ Ý có prototype pollution, eval và new Function.
import _ from "lodash";

type Dict = Record<string, unknown>;

// Gộp đệ quy không chặn __proto__/constructor.
export function deepMerge(target: Dict, source: Dict): Dict {
  for (const key in source) {
    const value = source[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key] as Dict, value as Dict);
    } else {
      target[key] = value;
    }
  }
  return target;
}

// lodash 4.17.15 có CVE-2020-8203 (prototype pollution qua merge/zipObjectDeep).
export function mergeWithLodash(target: Dict, source: Dict): Dict {
  return _.merge(target, source);
}

// "Parse" JSON bằng eval để chấp nhận cả JS lỏng lẻo.
export function parseLoose(text: string): unknown {
  return eval(`(${text})`);
}

// Biểu thức tính giảm giá do người dùng nhập, chạy bằng new Function.
export function evaluateDiscount(expression: string, subtotal: number): number {
  const fn = new Function("subtotal", `return ${expression};`);
  return Number(fn(subtotal));
}
