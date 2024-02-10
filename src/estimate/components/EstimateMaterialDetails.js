import React from "react";
import { parseFloatEst } from "../parseFloatEst";

const EstimateMaterialDetails = ({
  matList,
  discount,
  total,
  profit,
  isModuleRestricted,
}) => {
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
            <th width="34%">Product/Material Name</th>
            <th width="9%" style={{ textAlign: "left", paddingLeft: "1.1vw" }}>
              Qty
            </th>
            <th width="11%" style={{ textAlign: "left", paddingLeft: "1.1vw" }}>
              Unit Type
            </th>
            {!isModuleRestricted && (
              <>
                <th width="9%" style={{ textAlign: "right" }}>
                  Unit Cost
                </th>
                <th width="13%" style={{ textAlign: "right" }}>
                  Total Cost
                </th>
                <th width="10%" style={{ textAlign: "right" }}>
                  Mark up %
                </th>
                <th width="14%" style={{ textAlign: "right" }}>
                  Selling Price
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {matList.map((m) => (
            <tr>
              <td>{m.name}</td>
              <td style={{ textAlign: "left", paddingLeft: "1.1vw" }}>
                {m.units}
              </td>
              <td style={{ textAlign: "left", paddingLeft: "1.1vw" }}>
                {m.unitType}
              </td>
              {!isModuleRestricted && (
                <>
                  <td style={{ textAlign: "right" }}>
                    {(m.unitPrice || 0).toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {(
                      parseFloatEst(m.units) * parseFloatEst(m.unitPrice) || 0
                    ).toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td style={{ textAlign: "right" }}>{m.margin}</td>
                  <td style={{ textAlign: "right" }}>
                    {(m.sellingPrice || 0).toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </>
              )}
            </tr>
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
                      <td width="25%" className="no-bottom-td">
                        Discount
                      </td>
                      <td colSpan="3" className="no-bottom-td">
                        {(discount || 0).toLocaleString(navigator.language, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{ background: "#FFEBEB" }}
                        className="no-bottom-td"
                      >
                        Item Cost
                      </td>
                      <td
                        style={{ background: "#FFEBEB" }}
                        className="no-bottom-td"
                      >
                        {((total || 0) - (profit || 0)).toLocaleString(
                          navigator.language,
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>
                      <td
                        style={{ background: "#E4F3E8" }}
                        className="no-bottom-td"
                      >
                        Item Profit
                      </td>
                      <td
                        style={{ background: "#E4F3E8" }}
                        className="no-bottom-td"
                      >
                        {(profit || 0).toLocaleString(navigator.language, {
                          minimumFractionDigits: 2,
                        })}
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

export default EstimateMaterialDetails;
