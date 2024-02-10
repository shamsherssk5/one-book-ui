import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import { getConfirmation } from "../../common/DialogBox";
import Filter_Clear from "../../tasks/assets/filter-clear.png";
import { parseFloatEst } from "../parseFloatEst";
const EstimateMaterialRow = ({
  materials,
  index,
  setMaterialList,
  materialsList,
  qty,
  setToken,
  rowID,
  setIsAnyRequestActive,
  cat,
  isModuleRestricted,
}) => {
  const [isNew, setIsNew] = useState(false);
  const [data, setData] = useState([]);
  const emptyMaterialRow = {
    units: "0",
    unitPrice: "",
    total: "",
    sellingPrice: "",
    margin: "",
    qty: qty,
  };
  const [materialRow, setMaterialRow] = useState(emptyMaterialRow);

  const deleteRow = () => {
    if (!materialRow.total || materialRow.total <= 0) {
      setMaterialList((prev) => {
        let updated = [...materialsList].filter((m) => m.id !== index);
        return updated;
      });
    } else {
      getConfirmation("You want to Delete Material?", async () => {
        await axios
          .post(
            process.env.REACT_APP_API_ENDPOINT + "/estimations/mat-row-delete",
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
            toast.success("Material Deleted successFully");
            setMaterialList((prev) => {
              let updated = [...materialsList].filter((m) => m.id !== index);
              return updated;
            });
          })
          .catch((err) => {
            toast.error("Material(s) Deletion failed");
          });
      });
    }
  };

  useEffect(() => {
    let row = materialsList.find((p) => p.id === index);
    if (row.isCopied && row.value) {
      if (!row.value.selectedValue.prodID) {
        setIsNew(true);
      }
      let updated = {
        ...row.value,
        unitPrice: (row.value.unitPrice || 0).toLocaleString(
          navigator.language,
          {
            minimumFractionDigits: 2,
          }
        ),
        sellingPrice:
          row.value.margin === "fixed"
            ? (row.value.sellingPrice || 0).toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
              })
            : row.value.sellingPrice,
        qty: qty,
      };
      setMaterialRow(updated);
    }
  }, [materialsList]);

  useEffect(() => {
    let row = materialsList.find((p) => p.id === index);
    if (row.isCopied) {
      let updated = materialsList.map((m) => {
        return { ...m, isCopied: false };
      });
      setMaterialList(updated);
      return;
    }
    if (materialRow.unitPrice) {
      setMaterialList((prev) => {
        let updated = [...prev].filter((p) => {
          if (p.id === index) {
            p.value = { ...materialRow };
          }
          return p;
        });
        return updated;
      });
      handleMatRowAddition();
    }
  }, [materialRow]);

  const handleMatRowAddition = async () => {
    let count = materialsList.filter((m) => !m.value).length;
    if (count < 1) {
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/estimations/mat-row-addition",
          { rowID: rowID },
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
            setMaterialList([...materialsList, ...res.data]);
          }
        })
        .catch((err) => {});
    }
  };
  const handleUnitsChange = (e) => {
    if (!e.target.value) {
      e.target.value = 0;
    }
    let units = e.target.value;
    let total =
      parseFloatEst(e.target.value) * parseFloatEst(materialRow.unitPrice);
    let sellingPrice =
      parseFloatEst(e.target.value) *
      (materialRow.margin === "fixed"
        ? parseFloatEst(materialRow.sellingPrice) / (materialRow.units || 1) ||
          materialRow.selectedValue.fixedSellingPrice
        : (parseFloatEst(materialRow.unitPrice) *
            (100 + parseFloatEst(materialRow.margin))) /
          100);
    setMaterialRow({
      ...materialRow,
      units: units,
      total: total,
      sellingPrice:
        materialRow.margin === "fixed"
          ? (sellingPrice || 0).toLocaleString(navigator.language, {
              minimumFractionDigits: 2,
            })
          : sellingPrice,
    });
    let data = [
      { name: "units", value: units },
      { name: "sellingPrice", value: sellingPrice },
    ];
    setData(data);
  };

  const handleUnitPriceChange = (e) => {
    if (!e.target.value) {
      e.target.value = 0;
    }
    let unitPrice = e.target.value;
    let sellingPrice =
      materialRow.units *
      (materialRow.margin === "fixed"
        ? parseFloatEst(materialRow.sellingPrice) / (materialRow.units || 1) ||
          materialRow.selectedValue.fixedSellingPrice
        : (parseFloatEst(e.target.value) *
            (100 + parseFloatEst(materialRow.margin))) /
          100);
    setMaterialRow({
      ...materialRow,
      unitPrice: unitPrice,
      total: parseFloatEst(e.target.value) * parseFloatEst(materialRow.units),
      sellingPrice:
        materialRow.margin === "fixed"
          ? (sellingPrice || 0).toLocaleString(navigator.language, {
              minimumFractionDigits: 2,
            })
          : sellingPrice,
    });
    let data = [
      { name: "unitPrice", value: unitPrice },
      { name: "sellingPrice", value: sellingPrice },
    ];
    setData(data);
  };

  useEffect(() => {
    if (
      cat &&
      cat.category &&
      materialRow.margin !== "fixed" &&
      materialRow.selectedValue &&
      (cat.category === materialRow.selectedValue.category ||
        (cat.category === "UnSpecified" && !materialRow.selectedValue.category))
    ) {
      let sellingPrice =
        (materialRow.units *
          (parseFloatEst(materialRow.unitPrice) *
            (100 + parseFloatEst(cat.margin || 0)))) /
        100;
      setMaterialRow({
        ...materialRow,
        margin: cat.margin || 0,
        sellingPrice: sellingPrice,
      });
      let data = [
        { name: "margin", value: cat.margin },
        { name: "sellingPrice", value: sellingPrice },
      ];
      updateBackend(data);
    }
  }, [cat]);

  const handleMarginChange = (e) => {
    if (!e.target.value) {
      e.target.value = 0;
    }
    let sellingPrice =
      (materialRow.units *
        (parseFloatEst(materialRow.unitPrice) *
          (100 + parseFloatEst(e.target.value)))) /
      100;
    setMaterialRow({
      ...materialRow,
      margin: e.target.value,
      sellingPrice: sellingPrice,
    });
    let data = [
      { name: "margin", value: e.target.value },
      { name: "sellingPrice", value: sellingPrice },
    ];
    setData(data);
  };

  const handleSellingPriceChange = (e) => {
    if (!e.target.value) {
      e.target.value = 0;
    }
    setMaterialRow({
      ...materialRow,
      sellingPrice: e.target.value,
    });
    let data = [{ name: "sellingPrice", value: parseFloatEst(e.target.value) }];
    setData(data);
  };
  const handleReduceLimitAmountCheck = (e) => {
    if (!e.target.value) {
      e.target.value = 0;
      return;
    }
    if (
      parseFloatEst(materialRow.units) > 0 &&
      parseFloatEst(e.target.value || 0) <
        parseFloatEst(materialRow.selectedValue.reduceLimitAmount || 0) *
          parseFloatEst(materialRow.units)
    ) {
      getConfirmation(
        "This Item Selling Price Reduce Limit Per Qty is " +
          materialRow.selectedValue.reduceLimitAmount +
          ". Do You still want to Proceed?",
        () => {
          updateBackend();
        },
        () => {
          e.target.value =
            parseFloatEst(materialRow.selectedValue.fixedSellingPrice) *
            parseFloatEst(materialRow.units);
          let sellingPrice =
            parseFloatEst(materialRow.selectedValue.fixedSellingPrice) *
            parseFloatEst(materialRow.units);
          setMaterialRow({
            ...materialRow,
            sellingPrice: sellingPrice,
          });
          let data = [{ name: "sellingPrice", value: sellingPrice }];
          updateBackend(data);
        }
      );
    } else {
      updateBackend();
    }
  };
  useEffect(() => {
    let row = materialsList.find((p) => p.id === index);
    if (row.isCopied) return;
    if (!qty) return;
    let units = parseFloatEst(
      (materialRow.units / materialRow.qty) * parseFloatEst(qty || 1)
    );
    let sellingPrice =
      (materialRow.units / materialRow.qty) *
      parseFloatEst(qty || 1) *
      (materialRow.margin === "fixed"
        ? parseFloatEst(materialRow.sellingPrice) / (materialRow.units || 1) ||
          materialRow.selectedValue.fixedSellingPrice
        : (parseFloatEst(materialRow.unitPrice) *
            (100 + parseFloatEst(materialRow.margin))) /
          100);
    setMaterialRow((prev) => {
      return {
        ...prev,
        units: units,
        total:
          parseFloatEst(prev.units / prev.qty) *
          parseFloatEst(qty || 1) *
          parseFloatEst(prev.unitPrice),
        sellingPrice:
          materialRow.margin === "fixed"
            ? (sellingPrice || 0).toLocaleString(navigator.language, {
                minimumFractionDigits: 2,
              })
            : sellingPrice,
        qty: qty,
      };
    });
    let data = [
      { name: "units", value: units },
      { name: "sellingPrice", value: sellingPrice },
    ];
    updateBackend(data);
  }, [qty]);

  const handleMaterialChange = (selected, type) => {
    if (!!selected.__isNew__) {
      setIsNew(true);
      setMaterialRow({
        ...materialRow,
        selectedValue: {
          itemName: type === "item" ? selected.value : "",
          shotKey: type === "item" ? "" : selected.value,
          unitType: "Manual",
        },
        units: materialRow.units || 1,
        unitPrice: (0).toLocaleString(navigator.language, {
          minimumFractionDigits: 2,
        }),
        total: 0,
        margin: 0,
        sellingPrice: 0,
      });
      let data = [
        { name: "units", value: materialRow.units || 1 },
        { name: "unitPrice", value: 0 },
        { name: "margin", value: 0 },
        { name: "sellingPrice", value: 0 },
        { name: "name", value: type === "item" ? selected.value : "" },
        { name: "shortKey", value: type === "item" ? "" : selected.value },
        { name: "unitType", value: "Manual" },
      ];
      updateBackend(data);
    } else {
      let available = materialsList
        .filter(
          (l) =>
            !!l &&
            !!l.value &&
            !!l.value.selectedShotKey &&
            !!l.value.selectedShotKey.value
        )
        .map((l) => l.value.selectedShotKey.value)
        .some((shotKey) => shotKey === selected.value);
      if (available) {
        toast.error("Material Already Exists");
        setMaterialRow({
          ...materialRow,
          selectedValue: null,
          selectedShotKey: null,
          selectedItemName: null,
          units: materialRow.units || 1,
          unitPrice: 0.0,
          total: 0,
          margin: 0,
          sellingPrice: 0,
        });
      } else {
        let selectedRow = materials.find((d) => d.shotKey === selected.value);
        let margin =
          selectedRow.marginType === "percentage"
            ? selectedRow.sellingPercentage
            : selectedRow.marginType === "fixed"
            ? selectedRow.marginType
            : "";
        let sellingPrice =
          selectedRow.marginType === "percentage"
            ? (parseFloatEst(selectedRow.unitPrice) *
                (100 + parseFloatEst(selectedRow.sellingPercentage))) /
              100
            : selectedRow.marginType === "fixed"
            ? parseFloatEst(selectedRow.fixedSellingPrice)
            : 0;
        setMaterialRow({
          ...materialRow,
          selectedValue: selectedRow,
          selectedShotKey: {
            value: selectedRow.shotKey,
            label: selectedRow.shotKey,
          },
          selectedItemName: {
            value: selectedRow.shotKey,
            label: selectedRow.itemName,
          },
          units: materialRow.units || 1,
          unitPrice: (selectedRow.unitPrice || 0).toLocaleString(
            navigator.language,
            {
              minimumFractionDigits: 2,
            }
          ),
          total: parseFloatEst(
            (materialRow.units || 1) * selectedRow.unitPrice
          ),
          margin: margin,
          sellingPrice:
            selectedRow.marginType === "fixed"
              ? parseFloatEst(
                  (materialRow.units || 1) * sellingPrice
                ).toLocaleString(navigator.language, {
                  minimumFractionDigits: 2,
                })
              : parseFloatEst((materialRow.units || 1) * sellingPrice),
        });

        let data = [
          { name: "units", value: materialRow.units || 1 },
          { name: "unitPrice", value: parseFloatEst(selectedRow.unitPrice) },
          { name: "margin", value: margin },
          {
            name: "sellingPrice",
            value: (materialRow.units || 1) * sellingPrice,
          },
          { name: "name", value: selectedRow.itemName },
          { name: "shortKey", value: selectedRow.shotKey },
          { name: "unitType", value: selectedRow.unitType },
        ];
        updateBackend(data);
      }
    }
  };
  const handleShotKeyChange = (e) => {
    if (!e.target.value && !materialRow.selectedValue.itemName) {
      setIsNew(false);
      setMaterialRow(emptyMaterialRow);
      return;
    }
    setMaterialRow({
      ...materialRow,
      selectedValue: {
        itemName: materialRow.selectedValue.itemName,
        shotKey: e.target.value,
        unitType: "Manual",
      },
    });
    let data = [
      { name: "name", value: materialRow.selectedValue.itemName },
      { name: "shortKey", value: e.target.value },
      { name: "unitType", value: "Manual" },
    ];
    setData(data);
  };

  const handleItemNameChange = (e) => {
    if (!e.target.value && !materialRow.selectedValue.shotKey) {
      setIsNew(false);
      setMaterialRow(emptyMaterialRow);
      return;
    }
    setMaterialRow({
      ...materialRow,
      selectedValue: {
        itemName: e.target.value,
        shotKey: materialRow.selectedValue.shotKey,
        unitType: "Manual",
      },
    });
    let data = [
      { name: "shortKey", value: materialRow.selectedValue.shotKey },
      { name: "name", value: e.target.value },
      { name: "unitType", value: "Manual" },
    ];
    setData(data);
  };

  const handleReduceLimitCheck = (e) => {
    if (!e.target.value) {
      e.target.value = 0;
      return;
    }
    if (
      parseFloatEst(e.target.value || 0) <
      parseFloatEst(materialRow.selectedValue.reduceLimit || 0)
    ) {
      getConfirmation(
        "This Item Margin's reduce Limit is " +
          materialRow.selectedValue.reduceLimit +
          "%. Do You still want to Proceed?",
        () => {
          updateBackend();
        },
        () => {
          e.target.value = materialRow.selectedValue.sellingPercentage;
          let sellingPrice =
            (materialRow.units *
              (parseFloatEst(materialRow.unitPrice) *
                (100 +
                  parseFloatEst(
                    materialRow.selectedValue.sellingPercentage
                  )))) /
            100;
          setMaterialRow({
            ...materialRow,
            margin: materialRow.selectedValue.sellingPercentage,
            sellingPrice: sellingPrice,
          });
          let data = [
            {
              name: "margin",
              value: materialRow.selectedValue.sellingPercentage,
            },
            { name: "sellingPrice", value: sellingPrice },
          ];
          updateBackend(data);
        }
      );
    } else {
      updateBackend();
    }
  };

  const optionStylesShotKey = {
    menuList: (styles) => {
      return {
        ...styles,
        position: "absolute",
        marginLeft: "3.5vw",
        bottom: "100%",
        zIndex: "100",
        backgroundColor: "white",
        border: "1px solid #c4c4c4",
      };
    },
  };
  const optionStylesItem = {
    menuList: (styles) => {
      return {
        ...styles,
        position: "absolute",
        marginLeft: "16vw",
        bottom: "100%",
        zIndex: "100",
        backgroundColor: "white",
        border: "1px solid #c4c4c4",
      };
    },
  };

  const updateBackend = async (d) => {
    if ((data && data.length > 0) || (d && d.length > 0)) {
      let properties = data;
      if (d && d.length > 0) {
        properties = d;
      }
      properties = properties.filter((prop) => !!prop.value);
      if (properties.length <= 0) return;
      setIsAnyRequestActive(true);
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/estimations/update-est-mat-row-form",
          {
            data: properties,
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
          setIsAnyRequestActive(false);
          setMaterialRow((prev) => {
            let updated = { ...prev };
            data.forEach((element) => {
              updated[element.name] = prev[element.name];
            });
            return updated;
          });
          console.log(err);
        });
    }
  };
  return (
    <tr>
      <td>
        {isNew ? (
          <input
            className="est-input est-units-input"
            type="text"
            value={materialRow.selectedValue.shotKey}
            onChange={handleShotKeyChange}
            onBlur={updateBackend}
            autoFocus
          />
        ) : (
          <CreatableSelect
            menuPosition="fixed"
            styles={optionStylesShotKey}
            isLoading={materials.length <= 0}
            isSearchable={true}
            placeholder={"Select ShortKey"}
            name="material"
            onChange={(selected) => handleMaterialChange(selected, "shotKey")}
            value={materialRow.selectedShotKey}
            options={materials.map((p) => {
              return {
                value: p.shotKey,
                label: p.shotKey,
              };
            })}
          />
        )}
      </td>
      <td className="est-select-td">
        {isNew ? (
          <input
            className="est-input est-units-input"
            type="text"
            value={materialRow.selectedValue.itemName}
            onChange={handleItemNameChange}
            onBlur={updateBackend}
            autoFocus
          />
        ) : (
          <CreatableSelect
            menuPosition="fixed"
            styles={optionStylesItem}
            isLoading={materials.length <= 0}
            isSearchable={true}
            placeholder={"Select Material"}
            name="material"
            value={materialRow.selectedItemName}
            onChange={(selected) => handleMaterialChange(selected, "item")}
            options={materials.map((p) => {
              return {
                value: p.shotKey,
                label: p.itemName,
              };
            })}
          />
        )}
      </td>
      <td style={{ textAlign: "left", paddingLeft: "1.1vw" }}>
        <input
          className="est-input est-units-input"
          type="text"
          value={materialRow.units}
          onChange={handleUnitsChange}
          readOnly={!isNew && !materialRow.unitPrice}
          autoFocus={materialRow.unitPrice}
          onBlur={updateBackend}
          title={
            materialRow.selectedValue && materialRow.selectedValue.unitType
              ? materialRow.selectedValue.unitType
              : null
          }
        />
        {isModuleRestricted && (
          <img
            title="Close"
            className="search-close"
            src={Filter_Clear}
            onClick={deleteRow}
          />
        )}
      </td>
      {!isModuleRestricted && (
        <>
          <td>
            <input
              className="est-input est-units-input"
              type="text"
              value={materialRow.unitPrice}
              onChange={handleUnitPriceChange}
              readOnly={!isNew && !materialRow.unitPrice}
              onBlur={updateBackend}
              style={{ textAlign: "right" }}
            />
          </td>
          <td style={{ textAlign: "right" }}>
            {(materialRow.total || 0).toLocaleString(navigator.language, {
              minimumFractionDigits: 2,
            })}
          </td>
          <td>
            {isNew || (materialRow.margin && materialRow.margin !== "fixed") ? (
              <>
                <input
                  className="est-input est-units-input"
                  type="text"
                  value={materialRow.margin}
                  onChange={handleMarginChange}
                  onBlur={handleReduceLimitCheck}
                  readOnly={!isNew && !materialRow.unitPrice}
                />
                <span>%</span>
              </>
            ) : (
              materialRow.margin
            )}
          </td>
          <td style={{ textAlign: "right" }}>
            {materialRow.margin === "fixed" ? (
              <input
                className="est-input est-units-input"
                type="text"
                value={materialRow.sellingPrice}
                onChange={handleSellingPriceChange}
                onBlur={handleReduceLimitAmountCheck}
                readOnly={!isNew && !materialRow.unitPrice}
                style={{ textAlign: "right", paddingRight: "3px" }}
              />
            ) : (
              (materialRow.sellingPrice || 0).toLocaleString(
                navigator.language,
                {
                  minimumFractionDigits: 2,
                }
              )
            )}
            {materialRow.unitPrice && (
              <img
                title="Close"
                className="search-close"
                src={Filter_Clear}
                onClick={deleteRow}
              />
            )}
          </td>
        </>
      )}
    </tr>
  );
};

export default EstimateMaterialRow;
