import React, { useEffect } from "react";
import HSBar from "react-horizontal-stacked-bar-chart";

const EstimateCostProfit = ({ stats }) => {
  useEffect(() => {}, [stats]);
  return (
    <>
      {stats && !stats.isCreate && (
        <>
          <div className="messages task-details-container">
            <div className="message-Heading">Cost & Profit</div>
            <span className="est-currency-text-span">
              Currency ({stats.currency})
            </span>
          </div>

          <div className="empty-details-container blue-border"></div>
        </>
      )}
      <div className="history-container task-details-container">
        <table className="history-table equalDivide">
          <tbody>
            <tr>
              <td width={"50%"} className="blue-heading" align="left">
                Total Cost
              </td>
              <td width={"50%"} align="right" className="blue-heading">
                Estimated Profit
              </td>
            </tr>
            <tr />
            <tr>
              <td align="left" className="table-heading category-dark">
                {(stats.estTotal || 0).toLocaleString(navigator.language, {
                  minimumFractionDigits: 2,
                })}
              </td>
              <td align="right" className="table-heading category-dark">
                {(stats.estProfit || 0).toLocaleString(navigator.language, {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <HSBar
                  height={"1vh"}
                  id="hsbarExample"
                  data={[
                    {
                      value: stats.estTotal || 0,
                      description: "",
                      color: "#FF7A7A",
                    },
                    {
                      value: stats.estProfit || 0,
                      description: "",
                      color: "#4FAF64",
                    },
                  ]}
                />
              </td>
            </tr>
            <tr>
              <td align="left" className="table-heading">
                {stats.estProfit + stats.estTotal > 0
                  ? Math.round(
                      (stats.estTotal * 100) /
                        (stats.estProfit + stats.estTotal)
                    )
                  : 0}
                %
              </td>
              <td align="right" className="table-heading">
                {stats.estProfit + stats.estTotal > 0
                  ? Math.round(
                      (stats.estProfit * 100) /
                        (stats.estProfit + stats.estTotal)
                    )
                  : 0}
                %
              </td>
            </tr>
            <tr />
            <tr />
            <tr>
              <td align="left" className="table-heading">
                Discount
              </td>
              <td align="right" className="table-heading">
                -
                {(stats.discount || 0).toLocaleString(navigator.language, {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
            <tr>
              <td align="left" className="table-heading">
                Project value
              </td>
              <td align="right" className="table-heading">
                {(stats.estProfit + stats.estTotal || 0).toLocaleString(
                  navigator.language,
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </td>
            </tr>
            <tr>
              <td align="left" className="table-heading">
                {`${stats.taxLabel}(${stats.taxPercentage}%)`}
              </td>
              <td align="right" className="table-heading">
                {(stats.estTax || 0).toLocaleString(navigator.language, {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
            <tr style={{ borderBottom: "0.5px solid #239BCF" }} />
            <tr />
            <tr>
              <td align="left" className="table-heading category-dark">
                Grand Selling price
              </td>
              <td align="right" className="table-heading category-dark">
                {stats.currency} &nbsp;
                {(stats.estSellingPrice || 0).toLocaleString(
                  navigator.language,
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </td>
            </tr>
            <tr />
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EstimateCostProfit;
