import React from "react";
import { parseFloatEst } from "../../estimate/parseFloatEst";

const QuoteMaterialDetails = ({ matList }) => {
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
            </tr>
          ))}
          <tr></tr>
        </tbody>
      </table>
    </div>
  );
};

export default QuoteMaterialDetails;
