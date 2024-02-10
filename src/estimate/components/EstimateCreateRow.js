import React, { useEffect, useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import matDet from "../images/material-details.png";
import noMatDet from "../images/no-material-details.png";
import Dots from "../../tasks/assets/vertical-dots.png";
import Style from "../../tasks/css/task.module.css";
import EstimateCreateMaterial from "./EstimateCreateMaterial";
import toast from "react-hot-toast";
import axios from "axios";
import { getConfirmation } from "../../common/DialogBox";
import { parseFloatEst } from "../parseFloatEst";

const EstimateCreateRow = ({
  materials,
  estimateList,
  setEstimateList,
  index,
  haveErrors,
  setToken,
  scrollRef,
  estID,
  isEdit,
  est,
  setIsAnyRequestActive,
  cat,
  tax,
  provided,
  isModuleRestricted,
}) => {
  let emptyEstimateRow = {
    name: "",
    description: "",
    qty: "1",
    unitPrice: "",
    discount: "",
    total: "",
    tax: tax,
    isMatList: false,
  };
  const [estimateRow, setEstimateRow] = useState(emptyEstimateRow);
  const [isMatOpen, setIsMatOpen] = useState(false);
  const [materialsList, setMaterialList] = useState([]);
  useEffect(async () => {
    if (est && est.value === null) {
      setEstimateRow(emptyEstimateRow);
    } else if (isEdit && est && !est.hasOwnProperty("isCopied")) {
      setEstimateRow(est);
      if (est.isMatList === 1) {
        let matList = est.matList.map((mat) => {
          return {
            id: mat.id,
            value: {
              margin: mat.margin,
              qty: estimateRow.qty,
              selectedItemName: { value: mat.shortKey, label: mat.name },
              selectedShotKey: { value: mat.shortKey, label: mat.shortKey },
              selectedValue: materials.find(
                (mt) => mat.shortKey === mt.shotKey
              ) || {
                itemName: mat.name,
                shotKey: mat.shortKey,
                unitType: "Manual",
              },
              sellingPrice: mat.sellingPrice,
              total: estimateRow.qty * mat.units * mat.unitPrice,
              unitPrice: mat.unitPrice,
              units: mat.units,
            },
          };
        });
        setMaterialList(matList);
        setIsMatOpen(true);
      }
    }
  }, [isEdit, est]);

  const handleEstimateRowChange = (e) => {
    console.log(estimateRow);
    setEstimateRow({ ...estimateRow, [e.target.name]: e.target.value });
  };

  const updateBackend = async (name, value) => {
    if (name && name == "isMatList") {
      value = value ? 1 : 0;
    } else if (!name || !value) {
      return;
    }
    setIsAnyRequestActive(true);
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/estimations/update-est-row-form",
        {
          property: name,
          value: value,
          id: index,
        },
        {
          headers: {
            Authorization: window.localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setIsAnyRequestActive(false);
      })
      .catch((err) => {
        console.log(err);
        setIsAnyRequestActive(false);
        setEstimateRow({
          ...estimateRow,
          [name]: estimateRow[name],
        });
      });
  };
  useEffect(async () => {
    if (!index) return;
    if (materialsList && materialsList.length > 0) return;
    let row = estimateList.find((p) => p.id === index);
    if (row.isCopied) return;
    if (isEdit && est && est.matList && est.matList.length > 0) return;
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/estimations/create-initial-matRows",
        {
          rowID: index,
        },
        {
          headers: {
            Authorization: window.localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (res.data && res.data.length > 0) {
          setMaterialList(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [index, isMatOpen]);
  const handleMatClick = () => {
    setIsMatOpen(!isMatOpen);
  };

  useEffect(() => {
    if (isMatOpen) {
      setMaterialList((prev) => {
        let updated = [...prev].map((mat) => {
          if (mat.value) {
            mat["isCopied"] = true;
          }
          return mat;
        });
        return updated;
      });
    }
  }, [isMatOpen]);

  const [materialStat, setMaterialStat] = useState({
    total: 0,
    discount: estimateRow.discount || 0,
    profit: 0,
    unitPrice: 0,
    matList: null,
  });

  useEffect(() => {
    let row = estimateList.find((p) => p.id === index);
    if (row.isCopied) {
      let updated = [...estimateList].map((m) => {
        return { ...m, isCopied: false };
      });
      setEstimateList(updated);
      return;
    }
    let available = false;
    if (materialStat && materialStat.matList) {
      available = materialStat.matList.find((mat) => !!mat.value);
    }
    setEstimateList((prev) => {
      let updated = [...prev].filter((p) => {
        if (p.id === index) {
          p.value = {
            estimateRow: { ...estimateRow, isMatList: !!available },
            materialStat: materialStat,
          };
        }
        return p;
      });
      return updated;
    });
  }, [materialStat, estimateRow]);

  useEffect(() => {
    let available = false;
    if (materialStat && materialStat.matList) {
      available = materialStat.matList.find((mat) => !!mat.value);
    }
    if (estimateRow.isMatList === !!available) return;
    setEstimateRow({ ...estimateRow, isMatList: !!available });
    updateBackend("isMatList", !!available);
  }, [materialStat]);

  useEffect(() => {
    if (materialStat.unitPrice) {
      updateBackend("unitPrice", materialStat.unitPrice);
    }
  }, [materialStat.unitPrice]);

  useEffect(() => {
    let row = estimateList.find((p) => p.id === index);
    if (row.isCopied && row.value && row.value.value) {
      setEstimateRow(row.value.value.estimateRow);
      if (
        row.value.value.materialStat &&
        row.value.value.materialStat.matList
      ) {
        setMaterialList(row.value.value.materialStat.matList);
        setIsMatOpen(true);
      }
    }
  }, [estimateList]);
  const handleEstimateRowDelete = () => {
    document.body.click();
    getConfirmation("You want to Delete Estimate Row?", async () => {
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/estimations/row-delete",
          { id: index },
          {
            headers: {
              Authorization: window.localStorage.getItem("token"),
            },
          }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          toast.success("Estimate Row Deleted successFully");
          setEstimateList((prev) => {
            let updated = [...prev].filter((p) => p.id !== index);
            return updated;
          });
        })
        .catch((err) => {
          toast.error("Estimate Row Deletion failed");
        });
    });
  };

  const handleRowCopy = async () => {
    document.body.click();
    let row = estimateList.find((p) => p.id === index);
    let newRow = { ...row };
    let matList = [];
    if (row.value && row.value.materialStat && row.value.materialStat.matList) {
      matList = [...newRow.value.materialStat.matList];
    }
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/estimations/row-copy",
        { id: index, estID: estID },
        {
          headers: {
            Authorization: window.localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        if (res.data) {
          if (matList.length > 0) {
            let updated = [];
            [...matList].forEach((m) => {
              let material = { ...m };
              let mat = null;
              if (m.value) {
                mat = res.data.matList.find(
                  (ma) =>
                    ma.shortKey === m.value.selectedValue.shotKey &&
                    ma.name === m.value.selectedValue.itemName
                );
              } else {
                mat = res.data.matList.find((m) => !m.shortKey && !m.name);
              }
              if (mat) {
                material.id = mat.id;
                updated.push(material);
              }
            });
            newRow.value.materialStat.matList = updated;
          }
          setEstimateList((prev) => [
            ...prev,
            {
              id: res.data.id,
              value: { ...newRow },
              isCopied: true,
            },
          ]);
          toast.success("Estimate Row Copied Successfully");
          scrollRef.current.scrollTop = estimateList.length * 500;
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Estimate Row Copy failed");
      });
  };

  return (
    <div
      ref={isEdit ? provided.innerRef : null}
      {...(isEdit ? provided.draggableProps : {})}
    >
      <tr
        className={
          haveErrors
            ? "task-list-row-container error"
            : "task-list-row-container"
        }
      >
        <td
          width="40%"
          className="ref-subject-container est-td"
          style={{
            paddingLeft: isEdit ? "3.85vw" : "2.65vw",
            paddingRight: "2.6vw",
          }}
        >
          {isEdit && (
            <span
              className="est-det-row-img dragAndDropImage"
              {...provided.dragHandleProps}
            ></span>
          )}
          <p className="list-subject">
            <input
              type="text"
              placeholder="Enter Item Name"
              className="est-entry-input"
              style={{ textAlign: "left" }}
              name="name"
              value={estimateRow.name}
              onChange={handleEstimateRowChange}
              onBlur={(e) => updateBackend(e.target.name, e.target.value)}
            />
          </p>
          <p style={{ height: "0.85vh" }}></p>
          <p>
            <input
              type="text"
              name="description"
              value={estimateRow.description}
              onChange={handleEstimateRowChange}
              placeholder="Enter Desciption"
              className="est-entry-input"
              style={{ textAlign: "left" }}
              onBlur={(e) => updateBackend(e.target.name, e.target.value)}
            />
          </p>
        </td>
        <td
          width="11%"
          style={{
            textAlign: "right",
            paddingRight: "2.6vw",
            verticalAlign: "top",
          }}
        >
          <input
            type="text"
            className="est-entry-input"
            name="qty"
            value={estimateRow.qty}
            onChange={handleEstimateRowChange}
            onBlur={(e) => updateBackend(e.target.name, e.target.value)}
            readOnly={estimateRow.isMatList && !materialStat.total}
          />
        </td>
        <td
          width="13%"
          style={{
            textAlign: "right",
            paddingRight: "2.6vw",
            verticalAlign: "top",
          }}
        >
          <input
            type="text"
            className="est-entry-input"
            name="unitPrice"
            value={
              estimateRow.isMatList
                ? (materialStat.unitPrice || 0).toLocaleString(
                    navigator.language,
                    {
                      minimumFractionDigits: 2,
                    }
                  )
                : estimateRow.unitPrice
            }
            onChange={handleEstimateRowChange}
            onBlur={(e) => updateBackend(e.target.name, e.target.value)}
            readOnly={estimateRow.isMatList}
          />
        </td>
        <td
          width="11%"
          style={{
            textAlign: "right",
            paddingRight: "2.6vw",
            verticalAlign: "top",
          }}
        >
          <input
            type="text"
            className="est-entry-input"
            name="discount"
            value={estimateRow.discount}
            onChange={handleEstimateRowChange}
            onBlur={(e) => updateBackend(e.target.name, e.target.value)}
          />
        </td>
        <td
          width="8%"
          style={{
            textAlign: "right",
            paddingRight: "2.6vw",
            verticalAlign: "top",
          }}
        >
          <input
            type="text"
            className="est-entry-input"
            name="tax"
            value={estimateRow.tax}
            onChange={handleEstimateRowChange}
            onBlur={(e) => updateBackend(e.target.name, e.target.value)}
            readOnly
          />
        </td>
        <td
          width="17%"
          style={{
            textAlign: "right",
            paddingRight: "2.6vw",
            verticalAlign: "top",
          }}
        >
          <input
            type="text"
            readOnly
            className="est-entry-input"
            value={(
              (estimateRow.isMatList
                ? materialStat.total - materialStat.discount
                : parseFloatEst(estimateRow.qty || 0) *
                    parseFloatEst(estimateRow.unitPrice || 0) -
                  parseFloatEst(estimateRow.discount || 0)) || 0
            ).toLocaleString(navigator.language, {
              minimumFractionDigits: 2,
            })}
          />
          <OverlayTrigger
            placement="left"
            trigger="click"
            rootClose
            overlay={
              <Popover>
                <div className={Style.popup}>
                  <p className={Style.delete} onClick={handleEstimateRowDelete}>
                    Delete
                  </p>
                  <p className="p-leave" onClick={handleRowCopy}>
                    Copy
                  </p>
                </div>
              </Popover>
            }
          >
            <img
              title="Modify"
              variant="success"
              className="est-dots"
              src={Dots}
            />
          </OverlayTrigger>
          <img
            src={isMatOpen ? matDet : noMatDet}
            className="mat-det-img"
            onClick={handleMatClick}
          />
        </td>
      </tr>
      {isMatOpen && (
        <tr className="task-list-row-container">
          <td
            width="100%"
            style={{ paddingLeft: isEdit ? "3.85vw" : "2.65vw" }}
            className="est-select-td"
          >
            <EstimateCreateMaterial
              materials={materials}
              discount={estimateRow.discount || 0}
              qty={parseFloatEst(estimateRow.qty || 1)}
              materialStat={materialStat}
              setMaterialStat={setMaterialStat}
              materialsList={materialsList}
              setMaterialList={setMaterialList}
              setToken={setToken}
              rowID={index}
              setIsAnyRequestActive={setIsAnyRequestActive}
              cat={cat}
              isModuleRestricted={isModuleRestricted}
            />
          </td>
        </tr>
      )}
      <tr className="empty-row-container">
        <td width="100%" className="border-td" colSpan="8">
          <div></div>
        </td>
      </tr>
    </div>
  );
};

export default EstimateCreateRow;
