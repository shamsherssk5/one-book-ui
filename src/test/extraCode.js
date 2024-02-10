const handleOnchange = (e) => {
  let isAllChecked = estimateList.every(
    (d) => document.getElementById(d.id).checked
  );
  if (isAllChecked) {
    document.getElementById("all").checked = true;
  } else {
    document.getElementById("all").checked = false;
  }
};

const handleCheckAll = (e) => {
  estimateList.forEach((element) => {
    document.getElementById(element.id).checked = e.target.checked;
  });
};

<input
  id="all"
  className="chkbx est-chkbx"
  name="all"
  type="checkbox"
  onChange={handleCheckAll}
/>;

// .est-chkbx {
//     width: 1.2vw !important;
//     height: 1.2vw !important;
//     margin-left: -2.29vw;
//     position: absolute;
//     outline: none;
//   }
