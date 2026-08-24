export interface MasterParameterConfig {
  parameter: string;
  type: "NUMERIC" | "PRESENCE_ABSENCE" | "TEXT";
  pass?: {
    min: number;
    max: number;
  };
  fail?: {
    below?: number;
    above?: number;
  };
  passText?: string[];
  warningText?: string[];
}

export const MASTER_PARAMETER_CONFIGS: MasterParameterConfig[] = [
  // Physical & Chemical
  {
    parameter: "pH",
    type: "NUMERIC",
    pass: { min: 6.0, max: 8.5 },
    fail: { below: 4.5, above: 10.0 }
  },
  {
    parameter: "TDS",
    type: "NUMERIC",
    pass: { min: 0, max: 500 },
    fail: { above: 800.0 }
  },
  {
    parameter: "Turbidity",
    type: "NUMERIC",
    pass: { min: 0, max: 1.0 },
    fail: { above: 3.0 }
  },
  {
    parameter: "Sulphate",
    type: "NUMERIC",
    pass: { min: 0, max: 200 },
    fail: { above: 300 }
  },
  {
    parameter: "Colour",
    type: "TEXT",
    passText: ["agreeable"]
  },
  {
    parameter: "Residual Free Chlorine",
    type: "NUMERIC",
    pass: { min: 0, max: 0.2 },
    fail: { above: 0.2 }
  },
  {
    parameter: "Alkalinity",
    type: "NUMERIC",
    pass: { min: 0, max: 200 },
    fail: { above: 400 }
  },
  {
    parameter: "Chloride",
    type: "NUMERIC",
    pass: { min: 0, max: 250 },
    fail: { above: 500 }
  },
  {
    parameter: "Odour",
    type: "TEXT",
    passText: ["agreeable"]
  },
  {
    parameter: "Taste",
    type: "TEXT",
    passText: ["agreeable"]
  },

  // Microbiological (Pathogens)
  {
    parameter: "E.coli",
    type: "PRESENCE_ABSENCE"
  },
  {
    parameter: "Coliform",
    type: "PRESENCE_ABSENCE"
  },
  {
    parameter: "Pseudomonas",
    type: "PRESENCE_ABSENCE"
  },
  {
    parameter: "Clostridia",
    type: "PRESENCE_ABSENCE"
  },
  {
    parameter: "Yeast & Mold",
    type: "PRESENCE_ABSENCE"
  },

  // Microbiological (Counts)
  {
    parameter: "Aerobic Microbial Count 22°C",
    type: "NUMERIC",
    pass: { min: 0, max: 100 },
    fail: { above: 200 }
  },
  {
    parameter: "Aerobic Microbial Count 37°C",
    type: "NUMERIC",
    pass: { min: 0, max: 20 },
    fail: { above: 50 }
  }
];

export function evaluate(
  parameterName: string,
  value: number | string | null
): "PASS" | "WARNING" | "FAIL" {
  const config = MASTER_PARAMETER_CONFIGS.find(
    c => c.parameter.toLowerCase() === parameterName.toLowerCase()
  );
  if (!config) return "PASS";

  let status: "PASS" | "WARNING" | "FAIL" = "PASS";
  let passRange = "—";
  let failRange = "—";

  if (config.type === "NUMERIC") {
    let val: number | null = null;
    if (typeof value === "number") {
      val = value;
    } else if (typeof value === "string" && value.trim() !== "") {
      const lower = value.toLowerCase().trim();
      if (lower === "absent") {
        val = 0;
      } else if (lower === "present") {
        val = config.pass ? config.pass.max + 1 : 1;
      } else {
        val = parseFloat(value);
      }
    }

    // Ranges for logging
    if (config.pass) {
      passRange = `${config.pass.min}–${config.pass.max}`;
    }
    const belowStr = config.fail?.below !== undefined ? `<${config.fail.below}` : "";
    const aboveStr = config.fail?.above !== undefined ? `>${config.fail.above}` : "";
    failRange = [belowStr, aboveStr].filter(Boolean).join(" OR ") || "—";

    if (val === null || isNaN(val)) {
      status = "PASS"; // Default to PASS for empty inputs
    } else {
      // 1. Check FAIL range
      let isFail = false;
      if (config.fail) {
        if (config.fail.below !== undefined && val < config.fail.below) {
          isFail = true;
        }
        if (config.fail.above !== undefined && val > config.fail.above) {
          isFail = true;
        }
      }

      if (isFail) {
        status = "FAIL";
      } else {
        // 2. Check PASS range
        let isPass = false;
        if (config.pass) {
          if (val >= config.pass.min && val <= config.pass.max) {
            isPass = true;
          }
        }
        if (isPass) {
          status = "PASS";
        } else {
          // 3. Otherwise WARNING
          status = "WARNING";
        }
      }
    }
  } else if (config.type === "PRESENCE_ABSENCE") {
    const valStr = typeof value === "string" ? value : (value !== null && value !== undefined ? String(value) : null);
    passRange = "Absent";
    failRange = "Present";

    if (!valStr || valStr === "—" || valStr === "Not Entered") {
      status = "PASS";
    } else if (valStr.toLowerCase() === "absent") {
      status = "PASS";
    } else {
      status = "FAIL";
    }
  } else if (config.type === "TEXT") {
    const valStr = typeof value === "string" ? value : (value !== null && value !== undefined ? String(value) : null);
    passRange = config.passText ? config.passText.join(", ") : "agreeable, unobjectionable";
    failRange = "Any other value";

    if (!valStr || valStr === "—") {
      status = "PASS";
    } else {
      const lowerVal = valStr.toLowerCase();
      const isPass = config.passText?.some(t => t.toLowerCase() === lowerVal) ||
        ["agreeable", "unobjectionable"].includes(lowerVal);
      const isWarning = config.warningText?.some(t => t.toLowerCase() === lowerVal) ||
        ["mild", "slight"].includes(lowerVal);
      if (isPass) {
        status = "PASS";
      } else if (isWarning) {
        status = "WARNING";
      } else {
        status = "FAIL";
      }
    }
  }

  // Runtime logging
  console.log(`----------------------------------------`);
  console.log(`Parameter Name: ${parameterName}`);
  console.log(`Measured Value: ${value}`);
  console.log(`PASS Range: ${passRange}`);
  console.log(`FAIL Range: ${failRange}`);
  console.log(`Calculated Status: ${status}`);
  if (status === "FAIL") {
    const err = new Error();
    const stackLines = (err.stack || "").split("\n");
    // Show call trace
    console.log(`FAIL TRIGGERED BY STACK TRACE:`);
    stackLines.slice(2, 6).forEach((line) => {
      console.log(`  ${line.trim()}`);
    });
  }
  console.log(`----------------------------------------`);

  return status;
}

export function evaluateParameterResult(
  parameterName: string,
  value: number | null,
  stringValue: string | null
): "PASS" | "WARNING" | "FAIL" {
  return evaluate(parameterName, stringValue || value);
}
