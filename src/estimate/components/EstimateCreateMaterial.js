import React, { useEffect, useState } from "react";
import { parseFloatEst } from "../parseFloatEst";
import EstimateMaterialRow from "./EstimateMaterialRow";

const EstimateCreateMaterial = ({
  materials,
  discount,
  qty,
  materialStat,
  setMaterialStat,
  materialsList,
  setMaterialList,
  setToken,
  rowID,
  setIsAnyRequestActive,
  cat,
  isModuleRestricted,
}) => {
  useEffect(() => {
    let tot = materialsList
      .filter((d) => !!d.value)
      .map((d) => (d.value.total ? parseFloatEst(d.value.total) : 0))
      .reduce((a, c) => a + c, 0);
    let sellingPrice = materialsList
      .filter((d) => !!d.value)
      .map((d) =>
        d.value.sellingPrice ? parseFloatEst(d.value.sellingPrice) : 0
      )
      .reduce((a, c) => a + c, 0);
    let prof = sellingPrice - tot - parseFloatEst(discount || 0);
    setMaterialStat({
      total: sellingPrice,
      discount: discount,
      profit: prof,
      matList: materialsList,
      unitPrice: sellingPrice / parseFloatEst(qty || 1),
    });
  }, [materialsList, discount, rowID]);

  return (
    <div className="est-mat-det-cont">
      <table
        className="est-mat-details-table"
        cellPadding="0"
        cellSpacing="0"
        width="100%"
      >
        <thead>
          <tr>
            <th width="14%" style={{ textAlign: "left", paddingLeft: "1.1vw" }}>
              Short Key
            </th>
            <th width="34%">Product/Material Name</th>
            <th width="8%" style={{ textAlign: "left", paddingLeft: "1.1vw" }}>
              Qty
            </th>
            {!isModuleRestricted && (
              <>
                <th width="9%" style={{ textAlign: "left" }}>
                  Unit Cost
                </th>
                <th width="13%" style={{ textAlign: "right" }}>
                  Total Cost
                </th>
                <th width="9%" style={{ textAlign: "left" }}>
                  Mark up %
                </th>
                <th width="13%" style={{ textAlign: "right" }}>
                  Selling Price
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {materialsList.map((m) => (
            <EstimateMaterialRow
              key={m.id}
              materials={materials}
              index={m.id}
              setMaterialList={setMaterialList}
              materialsList={materialsList}
              qty={qty}
              setToken={setToken}
              rowID={rowID}
              setIsAnyRequestActive={setIsAnyRequestActive}
              cat={cat}
              isModuleRestricted={isModuleRestricted}
            />
          ))}
          {!isModuleRestricted && (
            <tr>
              <td colSpan="7" className="est-details-total-container-td">
                <div className="est-details-total-container">
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    width="100%"
                    border="0"
                  >
                    <tr>
                      <td width="25%">Discount</td>
                      <td colSpan="3">
                        {(materialStat.discount || 0).toLocaleString(
                          navigator.language,
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ background: "#FFEBEB" }}>Item Cost</td>
                      <td style={{ background: "#FFEBEB" }}>
                        {(
                          (materialStat.total || 0) -
                          (materialStat.profit || 0) -
                          (materialStat.discount || 0)
                        ).toLocaleString(navigator.language, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td style={{ background: "#E4F3E8" }}>Item Profit</td>
                      <td style={{ background: "#E4F3E8" }}>
                        {(materialStat.profit || 0).toLocaleString(
                          navigator.language,
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default EstimateCreateMaterial;
