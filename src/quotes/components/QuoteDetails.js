import React, { useEffect, useRef } from "react";
import { useState } from "react";
import pdf from "../../estimate/images/pdf-exp.png";
import email from "../../estimate/images/email.png";
import print from "../../estimate/images/print-exp.png";
import Colors from "../../estimate/components/EstimateColors";
import moment from "moment-timezone";
import { Country, State } from "country-state-city";
import axios from "axios";
import { parseFloatEst } from "../../estimate/parseFloatEst";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { arrayMoveImmutable } from "array-move";
import QuoteEmail from "./QuoteEmail";
import QuoteRow from "./QuoteRow";
import generateQuotePDF from "./QuotePDFGenerator";
const QuoteDetails = ({
  currentQuote,
  setData,
  customer,
  loading,
  setToken,
  stats,
  setStats,
  setQuoteList,
  view,
  sideMenu,
  setSideMenu,
  dragAndDrop,
  downLoadBOM,
  setDownLoadBOM,
  logo,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const ref = useRef(null);
  const [quoteRows, setQuoteRows] = useState([]);
  const [style, setStyle] = useState({
    height: "10vh",
  });

  useEffect(() => {
    if (view !== "quote-details") return;
    if (quoteRows && quoteRows.length > 0) {
      let total = quoteRows
        .map((quoteRow) => quoteRow.total + quoteRow.discount)
        .reduce((a, b) => a + b, 0);
      let discount = quoteRows
        .map((quoteRow) => quoteRow.discount)
        .reduce((a, b) => a + b, 0);
      let totalTax =
        (parseFloatEst(currentQuote.taxPercentage) * (total - discount)) / 100;

      let profit = quoteRows
        .map((quoteRow) => {
          if (quoteRow.isMatList === 1) {
            return quoteRow.profit;
          } else {
            return quoteRow.total;
          }
        })
        .reduce((a, b) => a + b, 0);
      let quoteTot = quoteRows
        .map((quoteRow) => {
          if (quoteRow.isMatList === 1) {
            return quoteRow.total - quoteRow.profit;
          } else {
            return 0;
          }
        })
        .reduce((a, b) => a + b, 0);
      let quoteTax =
        (parseFloatEst(currentQuote.taxPercentage) * (quoteTot + profit)) / 100;
      setStats({
        total: total,
        discount: discount,
        netTotal: total - discount,
        totalTax: currentQuote.taxType === "no" ? 0 : totalTax,
        grandTotal:
          total -
          discount +
          (currentQuote.taxType === "exclusive" ? totalTax : 0),
        isCreate: false,
        quoteProfit: profit,
        quoteTotal: quoteTot,
        quoteTax: currentQuote.taxType === "no" ? 0 : quoteTax,
        quoteSellingPrice:
          quoteTot +
          profit +
          (currentQuote.taxType === "exclusive" ? quoteTax : 0),
        currency: currentQuote.currency,
        taxLabel: currentQuote.taxLabel,
        taxPercentage: currentQuote.taxPercentage,
      });
      setQuoteList(quoteRows);
    }
  }, [quoteRows, currentQuote, view]);
  useEffect(() => {
    if (view !== "quote-details") return;
    setSideMenu("view");
    const handleResize = (e) => {
      if (!currentQuote || ref.current === null) {
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
  }, [currentQuote, view]);

  useEffect(async () => {
    loading({ visibility: true, message: "Loading Quote Details..." });
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/quotes/quotes-row?quoteID=" +
          currentQuote.quoteID,
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
        setQuoteRows(updated);
        loading({ visibility: false });
      })
      .catch((err) => {
        console.log(err);
        loading({ visibility: false });
      });
  }, [currentQuote, view]);

  useEffect(() => {
    if (downLoadBOM) {
      let doc = generateQuotePDF(quoteRows, currentQuote, stats, true, logo);
      doc.save(
        currentQuote.refText +
          currentQuote.refNum +
          "-" +
          currentQuote.customer +
          "-" +
          currentQuote.projName +
          ".pdf"
      );
      setDownLoadBOM(false);
    }
  }, [downLoadBOM]);

  const exportPDF = (event) => {
    let doc = generateQuotePDF(quoteRows, currentQuote, stats, false, logo);
    let type = event.target.getAttribute("name");
    if (doc) {
      switch (type) {
        case "pdf": {
          doc.save(
            currentQuote.refText +
              currentQuote.refNum +
              "-" +
              currentQuote.customer +
              "-" +
              currentQuote.projName +
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
    let output = arrayMoveImmutable(quoteRows, source.index, destination.index);
    setQuoteRows(output);
    output
      .filter((quote) => !!quote.id)
      .forEach((quote, i) => {
        updateBackend("sequence", i, quote.id);
      });
  };

  const updateBackend = async (name, value, index) => {
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/quotes/update-quote-row-form",
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
          <QuoteEmail
            Trigger_Button={<img className="exp-img" src={email} />}
            setToken={setToken}
            currentQuote={currentQuote}
            quoteRows={quoteRows}
            stats={stats}
            logo={logo}
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
            {currentQuote.refText}
            {currentQuote.refNum}
          </p>
          <p className="projName-text">
            Project Name:
            <span
              style={
                currentQuote.projName &&
                currentQuote.projName.includes("duplicated")
                  ? {
                      color: "#f94444",
                    }
                  : {}
              }
            >
              {currentQuote.projName}
            </span>
          </p>
        </span>
        <span
          className="est-details-status-container"
          style={{
            border: "0.5px solid " + Colors[currentQuote.status],
            color: Colors[currentQuote.status],
          }}
        >
          {currentQuote.status}
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
                <td className="category-dark">{currentQuote.customer}</td>
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
                          {currentQuote.contactName}
                        </td>
                      </tr>
                      <tr>
                        <td className="table-heading">
                          {currentQuote.contactEmail}
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
                        {currentQuote.reference}
                      </tr>
                      <tr style={{ width: "100%!important" }}>
                        <td className="category-dark est-ref-td">
                          Created Date :
                        </td>
                        {moment(
                          currentQuote.created
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
                              currentQuote.created
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
                            currentQuote.created
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
                    Amount({currentQuote.currency})
                  </th>
                </tr>
              </thead>
              <tbody className="tbody-class est-tbody">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="Table">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {quoteRows.map((quoteRow, i) => (
                          <Draggable draggableId={i.toString()} index={i}>
                            {(provided) => (
                              <QuoteRow
                                key={`quote${i}`}
                                quoteRow={quoteRow}
                                setQuoteRows={setQuoteRows}
                                setToken={setToken}
                                isLast={i === quoteRows.length - 1}
                                provided={provided}
                                dragAndDrop={dragAndDrop}
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
                                {currentQuote.additionalNotes}
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
                                    Total Tax ({currentQuote.taxPercentage}%)
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
export default QuoteDetails;
