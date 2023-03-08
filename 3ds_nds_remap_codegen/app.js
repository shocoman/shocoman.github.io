const codeHexString = "10008FE204109FE5010080E010FF2FE1700400000000A0E108D04DE204008DE504309DE5013043E2000053E304308DE5FAFFFFCA08D08DE21EFF2FE1F0472DE90370A0E17330A0E3F4409FE50060A0E13830C4E50200A0E3EEFFFFEB7730A0E30890A0E33830C4E5EAFFFFEB0050D6E5A583A0E1743088E30900A0E33830C4E5768088E3E3FFFFEB3880C4E5E1FFFFEB8550A0E1019059E2FF5005E2F3FFFF1A020051E30D00001A0110D6E50860A0E3A153A0E1743085E30900A0E33830C4E5765085E3D3FFFFEB3850C4E5D1FFFFEB8110A0E1016056E2FF1001E2F3FFFF1A000057E31000000A0850A0E30010A0E36460A0E36670A0E30900A0E33860C4E5C4FFFFEB3870C4E5C2FFFFEB3830D4E58110A0E1010013E3FF1001E201108113015055E2F3FFFF1A0010C2E50200A0E3B8FFFFEB6230A0E33830C4E5F047BDE8B4FFFFEA000100046E30A0E307402DE90430CDE50030A0E30500CDE50320A0E10210A0E304008DE2B3FFFFEB0CD08DE204E09DE41EFF2FE10133A0E38020A0E381CCA0E310109FE5B403D1E1142283E5B4C3C1E1142283E51EFF2FE1000100040133A0E38020A0E3013C83E2142183E5B403C3E11EFF2FE16D30A0E307402DE90630CDE50030A0E30730CDE50130A0E306008DE20310A0E107208DE296FFFFEB0700DDE50CD08DE204E09DE41EFF2FE10133A0E313402DE90040A0E164009FE5142293E5800012E30400001A010050E2FAFFFF1A8020A0E3142283E50E0000EA8020A0E3142283E56F30A0E30630CDE50030A0E30730CDE50130A0E306008DE20310A0E107208DE27BFFFFEB0700DDE5003044E0000073E20300A0E008D08DE21040BDE81EFF2FE1A4781F00B5FFFFEA6C30A0E313402DE90430CDE50030A0E30040A0E10510CDE504008DE20320A0E10210A0E368FFFFEB0400A0E108D08DE21040BDE8A7FFFFEA10402DE9A5FFFFEB8000A0E31040BDE8CCFFFFEA10402DE9EAFFFFEB8000A0E31040BDE8C7FFFFEA10402DE9FE00A0E39AFFFFEB0000A0E31040BDE8C1FFFFEA8200A0E395FFFFEA70402DE90050A0E10140A0E14100A0E3FF1001E2ECFFFFEB000050E31100000A2414A0E18100A0E3FF1001E2E6FFFFEB000050E30B00000A2418A0E18100A0E3FF1001E2E0FFFFEB000050E30500000A241CA0E18100A0E3DBFFFFEB000050E3044085100700001A0000A0E37040BDE81EFF2FE18100A0E30110D5E4D2FFFFEB000050E3F7FFFF0A040055E1F8FFFF1A8300A0E36FFFFFEB8200A0E397FFFFEB4200A0E37040BDE8C2FFFFEA0010A0E14400A0E3C4FFFFEA0133A0E30020A0E3F0412DE9086293E5082283E56DFFFFEB6450A0E30040A0E10100A0E35DFFFFEB8200A0E385FFFFEB000050E30900001A015055E2F7FFFF1A0133A0E38020A0E3142283E538209FE5B443C2E1086283E5F041BDE81EFF2FE16450A0E324709FE507708FE0F51FA0E30700A0E1B3FFFFEB000050E3EFFFFF1A015055E2F8FFFF1AECFFFFEA0001000400010000F0412DE90030A0E30143A0E3087294E5083284E50060A0E147FFFFEBFF1006E20050A0E14400A0E381FFFFEB8030A0E3143284E50C309FE5B453C3E1087284E5F041BDE81EFF2FE10001000410402DE978309FE503308FE074209FE5003093E502409FE74D2F83E2022082E2020054E10600000A040053E10600001ABAFFFFEB50309FE5014084E203308FE0004083E51040BDE81EFF2FE1C82083E2020054E10100A0030700000AFA2083E2020054E10200A0030300000A4B3F83E2030054E1EEFFFF1A0300A0E3CCFFFFEBEBFFFFEA580400004804000020040000FE5F2DE9010000EBFE9FBDE800000000013040E2020053E30300008A10402DE9900000EB0000A0E31080BDE80000A0E31EFF2FE1F7B5D21A01920022150006000898441E0C404819875CBC46B75CBC4504D10132934203D1002C05D00022013501988542EFD10020FEBDFFFFF7B50227A02280210E4D10232800009792024903FFF7D8FF002811D001240A4E20433060A022280080210E231030009792024903FFF7C8FF002801D004437460F7BDC04678122000D413200030B585B0FFF7D6FF114C2368002B1DD00225A02280210E230E48009592024903FFF7ACFF002811D0436B0E211A0046321570542247331A700F23A8326B441A70FB3A0092002264681000A04705B030BDD41320009612200007B50223A0228021009305480A3392024903FFF787FF002800D03E300EBDC046A412200073B5A022022680210E231448009692024903FFF775FF124C124DA060002801D1002076BD2800A02280210A234630009692024903FFF764FFE060002803D0BC30036802332361FFF7C9FF60610028E7D000232360FFF796FF0120E2E7B0122000D41320007812200073B56B462A4C073322781870002A46D01A78012A2BD1FFF7BFFF207000283ED0244DAB689A0702D000221A80023384210022214E4900B45C9818013204708A42F9D11900012286262868FC311043886028699C1E4860E868760002430A60201C311C7ADF154B6C690225238014E01A78022A15D1F02204250E4B120259699B688C1C043B1B1B5802400D10430C4A5B0813439BB248808B80201C291C7ADF73BD1B78032BFBD1034B5C69064BDCE7C046D0132000D4132000C812200001E0FFFF00F8FFFF4C400000FFFFFFFF00C09FE51CFF2FE19D11200000000000FFB581B014460D461E460A9F01981146FFB581B0144605461E460A9F029970B506460B4C88000D183046615D010E0843B0433440204384B20020054682001119401C07280D61FEB502220C0191212C4BFFB500F031F8E443E4B2240920430203364B01201988C9430905090D114300231A0006A4C0460D001D41054202D05D00655B2A430133162BF5D131E001000200040008001000200040008000000200010004000820001000800040000100020010002000400080007EB56E46072400230E2269460C39A1438D4610B421480D2801DA00200AE080476A4650794007840F507A917A00F00AF824012043B5467EBD134B14491980D2435A80FFBDB52370B5802440B249B2421A1B0140185A434343240112191B19012012131B13002181B06846028043800A4D10232C882B80074A904701B02C80800D70BDC0460060C41E1011C41EFF0F00000071C41E00000000000000000000000001FFFFFF000000009001000000000000";
const keymapTableOffset = 0x81C;
const nubInitCallOffset = 0x6A0;
const launchDelayOffset = 0x8F0;
const nubThresholdOffset = 0x8B8;


let codeByteArray = null;

const defaultControlsTable = [
  0x0001, 0x0002, 0x0004, 0x0008, 0x0010, 0x0020, 0x0040, 0x0080, 0x0100,
  0x0200, 0x0400, 0x0800, 0x0010, 0x0020, 0x0040, 0x0080, 0, 0, 0, 0, 0, 0
];

const currentControlsTable = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const keyNames3DS = [
  "A",
  "B",
  "Select",
  "Start",
  "DPad Right",
  "DPad Left",
  "DPad Up",
  "DPad Down",
  "R",
  "L",
  "X",
  "Y",
  "CPad Right",
  "CPad Left",
  "CPad Up",
  "CPad Down",
  "ZR (New3DS)",
  "ZL (New3DS)",
  "CStick Right (New3DS)",
  "CStick Left (New3DS)",
  "CStick Up (New3DS)",
  "CStick Down (New3DS)",
];

const keyNamesNDS = [
  "A",
  "B",
  "Select",
  "Start",
  "DPad Right",
  "DPad Left",
  "DPad Up",
  "DPad Down",
  "R",
  "L",
  "X",
  "Y",
];

function hexToBytes(hex) {
  let bytes = [];
  for (let c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

function getCodeBytes() {
  if (!Array.isArray(codeByteArray)) {
    codeByteArray = hexToBytes(codeHexString);
  }

  // put back the nub init call (in case the user selected ZL or ZR)
  nubInitCall = codeHexString.substr(nubInitCallOffset * 2, 8);
  half1 = parseInt(nubInitCall.substr(0, 4), 16);
  half2 = parseInt(nubInitCall.substr(4, 4), 16);
  codeByteArray[nubInitCallOffset] = (half1 >> 8) & 0xFF;
  codeByteArray[nubInitCallOffset + 1] = half1 & 0xFF;
  codeByteArray[nubInitCallOffset + 2] = (half2 >> 8) & 0xFF;
  codeByteArray[nubInitCallOffset + 3] = half2 & 0xFF;

  return codeByteArray;
}

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

function checkboxClicked(row, col, event) {
  const bit = event.target.checked;
  const currVal = currentControlsTable[row];
  const newVal = (currVal & ~(1 << col)) | (bit << col);
  currentControlsTable[row] = newVal;

  regenerateActionReplayCheatcode();
}

function generateTable(rowNames, colNames) {
  let table = document.createElement("table");

  // add column names
  let topleft = document.createElement("td");
  const a = document.createElement("div");
  const b = document.createElement("div");
  topleft.className = 'mytd';
  a.className = "c1";
  a.textContent = "NDS Keys";
  b.className = "c2";
  b.textContent = "3DS Keys";
  topleft.appendChild(a);
  topleft.appendChild(b);

  let row = document.createElement("tr");
  row.appendChild(topleft);
  for (let i = 0; i < colNames.length; i++) {
    let cell = document.createElement("th");
    cell.textContent = colNames[i];
    cell.style = "writing-mode: vertical-rl; text-orientation: mixed;";
    row.appendChild(cell);
  }
  table.appendChild(row);

  for (let i = 0; i < rowNames.length; i++) {
    let row = document.createElement("tr");

    // add row name
    let cell = document.createElement("th");
    cell.textContent = rowNames[i];
    row.appendChild(cell);

    for (let j = 0; j < colNames.length; j++) {
      let cell = document.createElement("td");

      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.onchange = (e) => checkboxClicked(i, j, e);

      cell.appendChild(checkbox);
      row.appendChild(cell);
    }

    table.appendChild(row);
  }
  return table;
}

function fillTableWithDefaultValues(currentControlsMode) {
  const defaults = defaultControlsTable;
  for (let i = 0; i < defaults.length; i++) {
    currentControlsMode[i] = defaults[i];
  }
}

function refreshTable(tableElem, rawKeyValues) {
  for (let i = 1; i <= keyNames3DS.length; i++) {
    for (let j = 1; j <= keyNamesNDS.length; j++) {
      const cell = tableElem.rows[i].cells[j];
      let checkbox = cell.querySelector("input");
      checkbox.checked = false;
    }
  }

  for (let i = 0; i < keyNames3DS.length; i++) {
    let currentKey = rawKeyValues[i];
    let keysIndices = getOnesInBinary(currentKey);
    keysIndices.forEach((j) => {
      const cell = tableElem.rows[i + 1].cells[j + 1];
      let checkbox = cell.querySelector("input");
      checkbox.checked = true;
    });
  }

  regenerateActionReplayCheatcode();
}

function ar_code__bulk_write(bin, address, run_code = false) {
  if (bin.length % 8 != 0) {
    bin = bin.concat(Array(8 - (bin.length % 8)).fill(0)); // 8-byte alignment
  }

  const hexify = (num, pad) =>
    num.toString(16).padStart(pad, "0").toUpperCase();

  let code_type = run_code ? "C2000000" : `E${hexify(address, 7)}`;

  let ar_code = `${code_type} ${hexify(bin.length, 8)}\n`;
  for (let i = 0; i < bin.length; i += 8) {
    let nibble0 = bin[i] + (bin[i + 1] << 8);
    let nibble1 = bin[i + 2] + (bin[i + 3] << 8);
    let nibble2 = bin[i + 4] + (bin[i + 5] << 8);
    let nibble3 = bin[i + 6] + (bin[i + 7] << 8);
    const nibbles = [nibble0, nibble1, nibble2, nibble3].map((e) =>
      hexify(e, 4)
    );
    ar_code += `${nibbles[1]}${nibbles[0]} ${nibbles[3]}${nibbles[2]}\n`;
  }

  return ar_code;
}

function regenerateActionReplayCheatcode() {
  // "1XXXXXXX ????YYYY" to write YYYY into XXXXXXXX
  let arCode = "";
  const arCodeTextarea = document.getElementById("ar-code-area");

  const codeBytes = getCodeBytes();

  // patch-in key mappings
  for (let i = 0; i < keyNames3DS.length; i++) {
    const keyValue = currentControlsTable[i];
    const offset = keymapTableOffset + i * 2;
    codeBytes[offset] = keyValue & 0xff;
    codeBytes[offset + 1] = (keyValue >> 8) & 0xff;
  }

  const areNew3dsFeaturesUsed = currentControlsTable.slice(16).reduce((sum, a) => sum + a, 0) != 0;
  if (!areNew3dsFeaturesUsed) {
    // remove CStick, ZL & ZR support if they're not used
    codeByteArray[nubInitCallOffset] = 0;
    codeByteArray[nubInitCallOffset + 1] = 0;
    codeByteArray[nubInitCallOffset + 2] = 0;
    codeByteArray[nubInitCallOffset + 3] = 0;
  }

  arCode += `${ar_code__bulk_write(codeBytes, 0, true)}`;
  arCodeTextarea.value = arCode;
}

function updateLaunchDelay(val) {
  val = parseInt(val) || 1000;
  codeByteArray[launchDelayOffset] = val & 0xFF;
  codeByteArray[launchDelayOffset + 1] = (val >> 8) & 0xFF;
  codeByteArray[launchDelayOffset + 2] = (val >> 16) & 0xFF;
  codeByteArray[launchDelayOffset + 3] = (val >> 24) & 0xFF;
  regenerateActionReplayCheatcode();
}

function updateCStickThreshold(val) {
  val = parseInt(val) || 16;
  codeByteArray[nubThresholdOffset] = val & 0xFF;
  regenerateActionReplayCheatcode();
}

window.onload = function () {
  fillTableWithDefaultValues(currentControlsTable);

  const controlsTableElem = generateTable(keyNames3DS, keyNamesNDS);
  refreshTable(controlsTableElem, defaultControlsTable);

  const resetToDefaultBtnElem = document.createElement("button");
  resetToDefaultBtnElem.textContent = "Reset Table to Default";
  resetToDefaultBtnElem.addEventListener("click", (e) => {
    const currVals = currentControlsTable;
    fillTableWithDefaultValues(currVals);
    refreshTable(controlsTableElem, currVals);
  });

  const controlModesDiv = document.getElementById("control-modes");
  controlModesDiv.appendChild(resetToDefaultBtnElem);
  controlModesDiv.appendChild(controlsTableElem);

  // cheatcode copy button
  const copyCodeBtnElem = document.getElementById("copy-btn");
  copyCodeBtnElem.addEventListener("click", () => {
    const arCodeTextArea = document.getElementById("ar-code-area");
    copyTextToClipboard(arCodeTextArea.value);
  });

  // launch delay input field
  const launchDelayTextField = document.getElementById("launch-delay");
  updateLaunchDelay(launchDelayTextField.value);
  launchDelayTextField.addEventListener("change", (event) => {
    updateLaunchDelay(event.target.value);
  });

  // CStick sensitivity threshold input field
  const cstickThresholdTextField = document.getElementById("cstick-threshold");
  updateCStickThreshold(cstickThresholdTextField.value);
  cstickThresholdTextField.addEventListener("change", (event) => {
    updateCStickThreshold(event.target.value);
  });
};
