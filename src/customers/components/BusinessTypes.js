import { useEffect, useState } from "react";
import DonutChart from "react-donut-chart";

const BusinessTypes = ({ rightContent, data }) => {
  const [types, setTypes] = useState([]);
  useEffect(() => {
    setTypes(new Set(data.map((d) => d.businessType)));
  }, [data]);
  return (
    rightContent === "Business Types" &&
    data.length > 0 && (
      <div className="task-details-box">
        <div className="task-details-container">
          <table
            className="equalDivide"
            cellPadding="0"
            cellSpacing="0"
            width="100%"
            border="0"
          >
            <tbody>
              {[...types].map((type) => (
                <>
                  <tr>
                    <td className="table-heading category-dark" colSpan="2">
                      {type} (
                      {data.filter((d) => d.businessType === type).length}){" "}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading">Invoiced</td>
                    <td className="table-heading" align="right">
                      {data
                        .filter((d) => d.businessType === type)
                        .map((d) => parseInt(d.amount))
                        .reduce((a, c) => a + c, 0)}
                    </td>
                  </tr>
                  <tr></tr>
                </>
              ))}
            </tbody>
          </table>
        </div>
        <div className="task-details-container">
          <div className="cust-chart-container">
            <DonutChart
              height={0.13 * window.innerWidth}
              width={0.13 * window.innerWidth}
              legend={false}
              colors={["#85C5F3", "#187ACB", "#2687D7"]}
              strokeColor={"black"}
              selectedOffset={0.009}
              formatValues={(value, total) =>
                `${value === 0 ? total : value} AED`
              }
              data={[
                { label: "TOTAL INVOICED", value: 0 },
                ...[...types].map((type) => {
                  return {
                    label: type,
                    value: data
                      .filter((d) => d.businessType === type)
                      .map((d) => parseInt(d.amount))
                      .reduce((a, c) => a + c, 0),
                  };
                }),
              ]}
            />
          </div>
        </div>
      </div>
    )
  );
};

export default BusinessTypes;
