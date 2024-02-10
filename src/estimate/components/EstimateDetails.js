import React, { useEffect, useRef } from "react";
import { useState } from "react";
import pdf from "../images/pdf-exp.png";
import email from "../images/email.png";
import print from "../images/print-exp.png";
import Colors from "./EstimateColors";
import EstimateRow from "./EstimateRow";
import moment from "moment-timezone";
import { Country, State } from "country-state-city";
import axios from "axios";
import { parseFloatEst } from "../parseFloatEst";
import generateEstPDF from "./EstimatePDFGenerator";
import toast from "react-hot-toast";
import { getProceed } from "../../common/DialogBox";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { arrayMoveImmutable, arrayMoveMutable } from "array-move";
import EstimateEmail from "./EstimateEmail";
import generateQuotePDF from "../../quotes/components/QuotePDFGenerator";
const EstimateDetails = ({
  currentEstimate,
  setData,
  customer,
  loading,
  setToken,
  stats,
  setStats,
  setEstList,
  view,
  sideMenu,
  setSideMenu,
  dragAndDrop,
  downLoadBOM,
  setDownLoadBOM,
  logo,
  isModuleRestricted,
  organization,
  financialDetails,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const ref = useRef(null);
  const [estimateRows, setEstimateRows] = useState([]);
  const [style, setStyle] = useState({
    height: "10vh",
  });

  useEffect(() => {
    if (view !== "est-details") return;
    if (estimateRows && estimateRows.length > 0) {
      let total = estimateRows
        .map((estRow) => estRow.total + estRow.discount)
        .reduce((a, b) => a + b, 0);
      let discount = estimateRows
        .map((estRow) => estRow.discount)
        .reduce((a, b) => a + b, 0);
      let totalTax =
        (parseFloatEst(currentEstimate.taxPercentage) * (total - discount)) /
        100;

      let profit = estimateRows
        .map((estRow) => {
          if (estRow.isMatList === 1) {
            return estRow.profit;
          } else {
            return estRow.total;
          }
        })
        .reduce((a, b) => a + b, 0);
      let estTot = estimateRows
        .map((estRow) => {
          if (estRow.isMatList === 1) {
            return estRow.total - estRow.profit;
          } else {
            return 0;
          }
        })
        .reduce((a, b) => a + b, 0);
      let estTax =
        (parseFloatEst(currentEstimate.taxPercentage) * (estTot + profit)) /
        100;
      setStats({
        total: total,
        discount: discount,
        netTotal: total - discount,
        totalTax: currentEstimate.taxType === "no" ? 0 : totalTax,
        grandTotal:
          total -
          discount +
          (currentEstimate.taxType === "exclusive" ? totalTax : 0),
        isCreate: false,
        estProfit: profit,
        estTotal: estTot,
        estTax: currentEstimate.taxType === "no" ? 0 : estTax,
        estSellingPrice:
          estTot +
          profit +
          (currentEstimate.taxType === "exclusive" ? estTax : 0),
        currency: currentEstimate.currency,
        taxLabel: currentEstimate.taxLabel,
        taxPercentage: currentEstimate.taxPercentage,
      });
      setEstList(estimateRows);
    }
  }, [estimateRows, currentEstimate, view]);
  useEffect(() => {
    if (view !== "est-details") return;
    setSideMenu("view");
    const handleResize = (e) => {
      if (!currentEstimate || ref.current === null) {
        return null;
      }
      let h = ref.current.clientHeight;
      setStyle({ height: `calc(100% - ${h}px - 4vh)` });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentEstimate, view]);

  useEffect(async () => {
    loading({ visibility: true, message: "Loading Estimate Details..." });
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/estimations/estimations-row?estID=" +
          currentEstimate.estID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        let updated = res.data.map((m) => {
          if (m.isMatList === 0) {
            m.total =
              parseFloatEst(m.unitPrice || 0) * parseFloatEst(m.qty || 0) -
              (m.discount || 0);
          } else {
            m.total = 0;
          }
          m.matList = [];
          return m;
        });
        setEstimateRows(updated);
        loading({ visibility: false });
      })
      .catch((err) => {
        console.log(err);
        loading({ visibility: false });
      });
  }, [currentEstimate, view]);

  useEffect(() => {
    if (downLoadBOM) {
      let doc = generateEstPDF(
        estimateRows,
        currentEstimate,
        stats,
        true,
        logo,
        customer,
        organization,
        financialDetails,
        isModuleRestricted
      );
      doc.save(
        currentEstimate.refText +
          currentEstimate.refNum +
          "-" +
          currentEstimate.customer +
          "-" +
          currentEstimate.projName +
          ".pdf"
      );
      setDownLoadBOM(false);
    }
  }, [downLoadBOM]);

  const exportPDF = (event) => {
    let doc = generateEstPDF(
      estimateRows,
      currentEstimate,
      stats,
      false,
      logo,
      customer,
      organization,
      financialDetails,
      isModuleRestricted
    );
    let type = event.target.getAttribute("name");
    if (doc) {
      switch (type) {
        case "pdf": {
          doc.save(
            currentEstimate.refText +
              currentEstimate.refNum +
              "-" +
              currentEstimate.customer +
              "-" +
              currentEstimate.projName +
              ".pdf"
          );
          break;
        }
        case "print": {
          doc.autoPrint();
          doc.output("dataurlnewwindow");
          break;
        }
        default: {
          break;
        }
      }

      doc.close();
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }
    let output = arrayMoveImmutable(
      estimateRows,
      source.index,
      destination.index
    );
    setEstimateRows(output);
    output
      .filter((est) => !!est.id)
      .forEach((est, i) => {
        updateBackend("sequence", i, est.id);
      });
  };

  const updateBackend = async (name, value, index) => {
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
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="est-details-main-div">
      <div className="est-side-heading">
        <span
          className={
            sideMenu === "view"
              ? "est-side-heading-button active"
              : "est-side-heading-button"
          }
          style={{ marginLeft: "5.62vw" }}
          onClick={() => setSideMenu("view")}
        >
          VIEW
        </span>
        <span
          className={
            sideMenu === "discussions"
              ? "est-side-heading-button active"
              : "est-side-heading-button"
          }
          style={{ marginLeft: "8.74vw" }}
          onClick={() => setSideMenu("discussions")}
        >
          DISCUSSIONS
        </span>
        <span
          className={
            sideMenu === "history"
              ? "est-side-heading-button active"
              : "est-side-heading-button"
          }
          style={{ marginLeft: "15.39vw" }}
          onClick={() => setSideMenu("history")}
        >
          HISTORY
        </span>
        <span className="exp-img-container">
          <img className="exp-img" src={pdf} name="pdf" onClick={exportPDF} />
          <EstimateEmail
            Trigger_Button={<img className="exp-img" src={email} />}
            setToken={setToken}
            currentEstimate={currentEstimate}
            estimateRows={estimateRows}
            stats={stats}
            logo={logo}
            isModuleRestricted={isModuleRestricted}
            customer={customer}
            organization={organization}
            financialDetails={financialDetails}
          />
          <img
            className="exp-img"
            src={print}
            name="print"
            onClick={exportPDF}
          />
        </span>
      </div>
      <div className="est-details-projname-container">
        <span className="est-proj-container">
          <p className="proj-ref-text">
            {currentEstimate.refText}
            {currentEstimate.refNum}
          </p>
          <p className="projName-text">
            Project Name:
            <span
              style={
                currentEstimate.projName &&
                currentEstimate.projName.includes("duplicated")
                  ? {
                      color: "#f94444",
                    }
                  : {}
              }
            >
              {currentEstimate.projName}
            </span>
          </p>
        </span>
        <span
          className="est-details-status-container"
          style={{
            border: "0.5px solid " + Colors[currentEstimate.status],
            color: Colors[currentEstimate.status],
          }}
        >
          {currentEstimate.status}
        </span>
      </div>
      <div className="est-details-table-container">
        <div className="est-detailes-table-top-cont" ref={ref}>
          <table
            className="equalDivide est-customer-details-cont"
            cellPadding="0"
            cellSpacing="0"
            width="100%"
            border="0"
          >
            <tbody>
              <tr>
                <td className="table-heading">Customer</td>
                <td className="table-heading">Attn:</td>
              </tr>
              <tr>
                <td className="category-dark">{currentEstimate.customer}</td>
                <td>
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    width="100%"
                    border="0"
                  >
                    <tbody>
                      <tr style={{ width: "100%!important" }}>
                        <td className="category-dark">
                          {currentEstimate.contactName}
                        </td>
                      </tr>
                      <tr>
                        <td className="table-heading">
                          {currentEstimate.contactEmail}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td className="table-heading" colSpan={2}>
                  Address:
                </td>
              </tr>
              <tr>
                <td style={{ paddingRight: "6vw" }}>
                  {customer.address}
                  <br />
                  {customer.country &&
                    State.getStateByCodeAndCountry(
                      customer.state,
                      customer.country
                    ).name}
                  &nbsp;-&nbsp;
                  {customer.country &&
                    Country.getCountryByCode(customer.country).name}
                  <br />
                  Phone: +{customer.phone}
                  <br />
                  Email : {customer.emailAccounts}
                  <br />
                </td>
                <td>
                  <table
                    cellPadding="0"
                    cellSpacing="0"
                    width="100%"
                    border="0"
                  >
                    <tbody>
                      <tr style={{ width: "100%!important" }}>
                        <td className="category-dark est-ref-td">
                          Reference :
                        </td>
                        {currentEstimate.reference}
                      </tr>
                      <tr style={{ width: "100%!important" }}>
                        <td className="category-dark est-ref-td">
                          Created Date :
                        </td>
                        {moment(
                          currentEstimate.created
                            .replace("T", " ")
                            .replace("Z", "")
                        ).format(currentUser.dateFormat)}
                      </tr>
                      <tr style={{ width: "100%!important" }}>
                        <td className="category-dark est-ref-td">
                          Expiry Date :
                        </td>
                        <span
                          className={
                            moment(
                              currentEstimate.created
                                .replace("T", " ")
                                .replace("Z", "")
                            )
                              .add(1, "M")
                              .isSameOrBefore(moment())
                              ? "expired"
                              : ""
                          }
                        >
                          {moment(
                            currentEstimate.created
                              .replace("T", " ")
                              .replace("Z", "")
                          )
                            .add(1, "M")
                            .format(currentUser.dateFormat)}
                        </span>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          className="list-container-box est-detailes-table-bottom-cont"
          style={style}
        >
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <table className="list-view-table" id="est-list-view-table">
              <thead className="thead-class est-thead">
                <tr className="list-view-header-row">
                  <th width="40%" style={{ paddingLeft: "3.85vw" }}>
                    Item & Description
                  </th>
                  <th
                    width="11%"
                    style={{ textAlign: "right", paddingRight: "2.6vw" }}
                  >
                    Qty
                  </th>
                  <th
                    width="13%"
                    style={{ textAlign: "right", paddingRight: "2.6vw" }}
                  >
                    Unit Price
                  </th>
                  <th
                    width="11%"
                    style={{ textAlign: "right", paddingRight: "2.6vw" }}
                  >
                    Discount
                  </th>
                  <th
                    width="8%"
                    style={{ textAlign: "right", paddingRight: "2.6vw" }}
                  >
                    Tax %
                  </th>
                  <th
                    width="17%"
                    style={{ textAlign: "right", paddingRight: "2.6vw" }}
                  >
                    Amount({currentEstimate.currency})
                  </th>
                </tr>
              </thead>
              <tbody className="tbody-class est-tbody">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="Table">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {estimateRows.map((estRow, i) => (
                          <Draggable draggableId={i.toString()} index={i}>
                            {(provided) => (
                              <EstimateRow
                                key={`est${i}`}
                                estRow={estRow}
                                setEstimateRows={setEstimateRows}
                                setToken={setToken}
                                isLast={i === estimateRows.length - 1}
                                provided={provided}
                                dragAndDrop={dragAndDrop}
                                isModuleRestricted={isModuleRestricted}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <tr className="empty-row-container">
                  <td width="100%" className="border-td" colSpan="8">
                    <div className="est-details-note-total-container">
                      <table
                        className="equalDivide"
                        cellPadding="0"
                        cellSpacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              colSpan="2"
                              className="table-heading category-dark"
                              style={{
                                paddingLeft: "3.05vw",
                                paddingBottom: "0.7vh",
                              }}
                            >
                              Additional Notes
                            </td>
                          </tr>
                          <tr width="100%">
                            <td
                              className="table-heading"
                              width="50%"
                              style={{
                                paddingLeft: "3.05vw",
                                position: "relative",
                              }}
                            >
                              <span className="est-add-note-container">
                                {currentEstimate.additionalNotes}
                              </span>
                            </td>
                            <td width="50%" style={{ paddingLeft: "9vw" }}>
                              <table
                                className="equalDivide est-total-container"
                                cellPadding="0"
                                cellSpacing="0"
                                width="100%"
                                border="0"
                              >
                                <tr>
                                  <td width="50%" className="table-heading">
                                    Total
                                  </td>
                                  <td className="table-heading" align="right">
                                    {(stats.total || 0).toLocaleString(
                                      navigator.language,
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                    )}
                                  </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                  <td className="table-heading">Discount</td>
                                  <td className="table-heading" align="right">
                                    {(stats.discount || 0).toLocaleString(
                                      navigator.language,
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                    )}
                                  </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                  <td className="table-heading category-dark">
                                    Net total
                                  </td>
                                  <td
                                    className="table-heading category-dark"
                                    align="right"
                                  >
                                    {(stats.netTotal || 0).toLocaleString(
                                      navigator.language,
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                    )}
                                  </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                  <td className="table-heading">
                                    Total Tax ({currentEstimate.taxPercentage}%)
                                  </td>
                                  <td className="table-heading" align="right">
                                    {(stats.totalTax || 0).toLocaleString(
                                      navigator.language,
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                    )}
                                  </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                  <td
                                    className="table-heading category-dark no-bottom-td"
                                    style={{ background: "#E4F3E8" }}
                                  >
                                    Grand Total Amount
                                  </td>
                                  <td
                                    className="table-heading category-dark no-bottom-td"
                                    align="right"
                                    style={{ background: "#E4F3E8" }}
                                  >
                                    {(stats.grandTotal || 0).toLocaleString(
                                      navigator.language,
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                    )}
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EstimateDetails;
