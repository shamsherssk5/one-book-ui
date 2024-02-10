import React, { useState } from "react";
import HSBar from "react-horizontal-stacked-bar-chart";
import CatAdd from "../images/cat-add.png";
import EstimateCategorySettings from "./EstimateCategorySettings";
const EstimateCategory = ({
  categories,
  updateCat,
  currency,
  materials,
  setMaterials,
  setToken,
}) => {
  return (
    <>
      <div className="messages task-details-container">
        <div className="message-Heading">category Types</div>
        <span className="est-currency-text-span">Currency ({currency})</span>
        <EstimateCategorySettings
          materials={materials}
          setMaterials={setMaterials}
          setToken={setToken}
          Trigger_Button={<img className="cat-add-button" src={CatAdd} />}
        />
      </div>
      <div className="empty-details-container blue-border"></div>
      <div className="history-container task-details-container">
        <table className="history-table equalDivide">
          <tbody>
            {categories.map((c, i) => (
              <>
                <tr>
                  <td
                    width={"50%"}
                    className="table-heading category-dark"
                    align="left"
                  >
                    {c.category}
                  </td>
                  <td width={"50%"} align="right" className="table-heading">
                    {c.category !== "Fixed" && (
                      <>
                        <input
                          type="text"
                          className="right-margin-input"
                          value={c.margin}
                          onChange={(e) =>
                            updateCat({
                              category: c.category,
                              margin: e.target.value,
                            })
                          }
                        />
                        <span>&nbsp;%</span>
                      </>
                    )}
                  </td>
                </tr>
                <tr>
                  <td align="left" className="table-heading category-dark">
                    {(c.cost || 0).toLocaleString(navigator.language, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td align="right" className="table-heading category-dark">
                    {(c.sellingPrice - c.cost || 0).toLocaleString(
                      navigator.language,
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <HSBar
                      height={"1vh"}
                      id="hsbarExample"
                      data={[
                        {
                          value: c.cost || 0,
                          description: "",
                          color: "#FF7A7A",
                        },
                        {
                          value: c.sellingPrice - c.cost || 0,
                          description: "",
                          color: "#4FAF64",
                        },
                      ]}
                    />
                  </td>
                </tr>
                <tr>
                  <td align="left" className="table-heading">
                    Cost
                  </td>
                  <td align="right" className="table-heading">
                    Category Profit
                  </td>
                </tr>
                <tr />
                {i !== categories.length - 1 && (
                  <tr style={{ borderBottom: "0.5px solid #239BCF" }}></tr>
                )}
                <tr />
              </>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EstimateCategory;
