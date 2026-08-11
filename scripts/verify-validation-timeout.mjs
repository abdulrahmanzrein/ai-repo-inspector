// quick check that the timeout fix actually works, without waiting out the
// real 2-minute production default. runValidation is the real function -
// just called with a short timeout override to prove the kill-on-timeout
// path deterministically and fast.
import { runValidation } from "../src/validation.js";

const start = Date.now();
const result = await runValidation("sleep 5", ".", 500);
const elapsed = Date.now() - start;

console.log("elapsed ms:", elapsed);
console.log("result:", JSON.stringify(result, null, 2));
