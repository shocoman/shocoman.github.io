const romNames = [
  "ASMP-D3D9F14A (Europe v1.0)",
  "ASMJ-D2BBD1E6 (Japan v1.1)",
  "ASMJ-D2F380B2 (Japan v1.0)",
  "ASMK-3C73EADE (Korea v1.0)",
  "ASME-AEA63749 (USA v1.0)",
  "ASME-F486F859 (USA v1.1)",
  "ASMC-4F664FC5 (China v1.0 (iQue))",
];
const romOffsets = [
  0x02075650, 0x02074160, 0x020738c0, 0x0206ff0c, 0x0207331c, 0x0207403c,
  0x020738a0,
];

const controlsTableByteSize = 32;
const controlsModes = ["Standard Mode", "Touch Mode", "Dual-Hand Mode"];
const defaultControlsTable = [
  [
    0x0001, 0x0002, 0x0004, 0x0008, 0x0010, 0x0020, 0x0040, 0x0080, 0x0400,
    0x4000, 0x8000, 0x0800, 0x0000, 0x0000, 0x0000, 0x0000,
  ],
  [
    0x0001, 0x0002, 0x0004, 0x0008, 0x0000, 0x0000, 0x0000, 0x0000, 0x0400,
    0x4000, 0x0100, 0x0200, 0x0000, 0x0000, 0x0000, 0x0000,
  ],
  [
    0x0001, 0x0400, 0x0004, 0x0008, 0x0001, 0x4000, 0x0002, 0x0400, 0x0000,
    0x0000, 0x0002, 0x4000, 0x0000, 0x0000, 0x0000, 0x0000,
  ],
];

const currentControlsTable = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const buttonNames = [
  "A",
  "B",
  "Select",
  "Start",
  "Right DPAD",
  "Left DPAD",
  "Up DPAD",
  "Down DPAD",
  "R",
  "L",
  "X",
  "Y",
  "? (ZR w/ mod)",
  "? (ZL w/ mod)",
  "?",
  "?",
];

const actionNames = [
  "Attack",
  "Jump",
  "Select???",
  "Start???",
  "Right DPAD",
  "Left DPAD",
  "Up DPAD",
  "Down DPAD",
  "Camera Right",
  "Camera Left",
  "Crouch",
  "Run",
  "?",
  "?",
  "Center Camera",
  "Change View",
];

function copyTextToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    () => {},
    (err) => {
      console.error("Text copy error: ", err);
    }
  );
}

function getOnesInBinary(num) {
  let binaryString = num.toString(2);
  let onBitIndexes = [];

  for (let i = 0; i < binaryString.length; i++) {
    if (binaryString[i] === "1") {
      onBitIndexes.push(binaryString.length - i - 1);
    }
  }

  return onBitIndexes;
}

function checkboxClicked(tableIndex, row, col, event) {
  const bit = event.target.checked;
  const currVal = currentControlsTable[tableIndex][row];
  const newVal = (currVal & ~(1 << col)) | (bit << col);
  currentControlsTable[tableIndex][row] = newVal;
  regenerateActionReplayCode();
}

function generateTable(tableIndex, rowNames, colNames) {
  let table = document.createElement("table");

  // add column names
  let row = document.createElement("tr");
  let cell = document.createElement("th");
  row.appendChild(cell);
  for (let i = 0; i < colNames.length; i++) {
    cell = document.createElement("th");
    cell.textContent = colNames[i];
    cell.style = "writing-mode: vertical-rl; text-orientation: mixed;";
    row.appendChild(cell);
  }
  table.appendChild(row);

  for (let i = 0; i < 16; i++) {
    let row = document.createElement("tr");

    // add row name
    let cell = document.createElement("th");
    cell.textContent = rowNames[i];
    row.appendChild(cell);

    for (let j = 0; j < 16; j++) {
      let cell = document.createElement("td");

      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.onchange = (e) => checkboxClicked(tableIndex, i, j, e);

      cell.appendChild(checkbox);
      row.appendChild(cell);
    }

    table.appendChild(row);
  }
  return table;
}

function setDefaultBytesForMode(tableIndex, currentControlsMode) {
  const defaults = defaultControlsTable[tableIndex];
  for (let i = 0; i < defaults.length; i++) {
    currentControlsMode[i] = defaults[i];
  }
}

function refreshTable(tableElem, rawValues) {
  for (let i = 1; i <= 16; i++) {
    for (let j = 1; j <= 16; j++) {
      const cell = tableElem.rows[i].cells[j];
      let checkbox = cell.querySelector("input");
      checkbox.checked = false;
    }
  }

  for (let i = 0; i < 16; i++) {
    let current_actio_val = rawValues[i];
    let actionIndexes = getOnesInBinary(current_actio_val);
    actionIndexes.forEach((j) => {
      const cell = tableElem.rows[i + 1].cells[j + 1];
      let checkbox = cell.querySelector("input");
      checkbox.checked = true;
    });
  }

  regenerateActionReplayCode();
}

function regenerateActionReplayCode() {
  // "1XXXXXXX ????YYYY" to write YYYY into XXXXXXXX
  let arCode = "";
  const includeDefaultElem = document.getElementById("include-default-vals");
  const arCodeTextarea = document.getElementById("ar-code-area");

  const romVersionSelectElem = document.getElementById("rom-version-select");
  const romVer = romVersionSelectElem.value;
  if (!romVer) {
    arCodeTextarea.value = "";
    return;
  }

  const controlsTableOffset = romOffsets[romVer];
  for (let n_mode = 0; n_mode < 3; n_mode++) {
    for (let i = 0; i < 16; i++) {
      const currVal = currentControlsTable[n_mode][i];
      const defaultVal = defaultControlsTable[n_mode][i];

      if (currVal !== defaultVal || includeDefaultElem.checked) {
        const offset = controlsTableOffset + (n_mode * 16 + i) * 2;
        const command = offset | 0x10000000;
        const commandStr = command.toString(16).substring(0, 8);
        const currValStr = currVal
          .toString(16)
          .padStart(8, "0")
          .substring(0, 8);
        arCode += `${commandStr} ${currValStr}\n`;
      }
    }
  }

  arCodeTextarea.value = arCode;
}

window.onload = function () {
  const romVersionSelectElem = document.getElementById("rom-version-select");
  romNames.forEach((v, i) => {
    let optionElement = document.createElement("option");
    optionElement.value = i;
    optionElement.textContent = v;
    romVersionSelectElem.appendChild(optionElement);
  });
  romVersionSelectElem.selectedIndex = -1;
  romVersionSelectElem.addEventListener("change", (e) => {
    const v = romVersionSelectElem.value;
    const addrMsg = document.getElementById("controls-table-address-msg");
    addrMsg.innerText = `(Table address: 0x${romOffsets[v].toString(16)})`;
    regenerateActionReplayCode();
  });

  for (let n_mode = 0; n_mode < 3; n_mode++) {
    setDefaultBytesForMode(n_mode, currentControlsTable[n_mode]);

    const controlsTableElem = generateTable(n_mode, buttonNames, actionNames);
    refreshTable(controlsTableElem, defaultControlsTable[n_mode]);

    const collapseDescr = document.createElement("summary");
    const modeNameElem = document.createElement("b");
    modeNameElem.innerText = controlsModes[n_mode];
    collapseDescr.appendChild(modeNameElem);

    const resetToDefaultBtnElem = document.createElement("button");
    resetToDefaultBtnElem.textContent = "Reset to Default";
    resetToDefaultBtnElem.addEventListener("click", (e) => {
      const currVals = currentControlsTable[n_mode];
      setDefaultBytesForMode(n_mode, currVals);
      refreshTable(controlsTableElem, currVals);
      console.log(controlsTableElem);
    });

    const collapsible = document.createElement("details");
    collapsible.appendChild(collapseDescr);
    collapsible.appendChild(resetToDefaultBtnElem);
    collapsible.appendChild(controlsTableElem);
    collapsible.appendChild(document.createElement("hr"));

    const controlModesDiv = document.getElementById("control-modes");
    controlModesDiv.appendChild(collapsible);
  }

  const copyCodeBtnElem = document.getElementById("copy-btn");
  copyCodeBtnElem.addEventListener("click", () => {
    const arCodeTextArea = document.getElementById("ar-code-area");
    copyTextToClipboard(arCodeTextArea.value);
  });

  const includeDefaultElem = document.getElementById("include-default-vals");
  includeDefaultElem.onchange = () => regenerateActionReplayCode();
};
