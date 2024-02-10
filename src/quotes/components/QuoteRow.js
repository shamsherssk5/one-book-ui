import axios from "axios";
import React, { useEffect, useState } from "react";
import det from "../../estimate/images/est-row.png";
import Open from "../../assets/images/next.png";
import File_Loader from "../../assets/images/file-loader.gif";
import { parseFloatEst } from "../../estimate/parseFloatEst";
import QuoteMaterialDetails from "./QuoteMaterialDetails";

const QuoteRow = ({
  quoteRow,
  setQuoteRows,
  setToken,
  isLast,
  provided,
  dragAndDrop,
}) => {
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = () => {
    if (quoteRow.isMatList === 0) {
      return;
    } else {
      setIsOpened(!isOpened);
    }
  };
  useEffect(async () => {
    if (quoteRow.isMatList === 0) {
      setIsOpened(true);
      return;
    } else {
      setIsOpened(false);
    }
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/quotes/quotes-mat-row?rowID=" +
          quoteRow.id,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        console.log(res);
        if (res.data.error) {
          setToken(undefined);
        }
        if (res.status === 200 && res.data && res.data.length === 0) {
          setIsOpened(true);
        }
        setQuoteRows((prev) => {
          let updated = [...prev].map((m) => {
            if (m.id === quoteRow.id) {
              m.isMatList = res.data && res.data.length > 0 ? 1 : 0;
              m.matList = res.data;
              if (res.data && res.data.length > 0) {
                let total = m.matList
                  .map(
                    (m) =>
                      parseFloatEst(m.unitPrice || 0) *
                      parseFloatEst(m.units || 0)
                  )
                  .reduce((a, b) => a + b, 0);
                let sellingPrice = m.matList
                  .map((m) => parseFloatEst(m.sellingPrice || 0))
                  .reduce((a, b) => a + b, 0);
                m.total = sellingPrice - parseFloatEst(m.discount || 0);
                m["profit"] =
                  sellingPrice - total - parseFloatEst(m.discount || 0);
              } else {
                m.total =
                  parseFloatEst(m.unitPrice || 0) * parseFloatEst(m.qty || 0) -
                  parseFloatEst(m.discount || 0);
              }
            }
            return m;
          });
          return updated;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (dragAndDrop) {
      setIsOpened(false);
    }
  }, [dragAndDrop]);
  return (
    <>
      <tr
        className="task-list-row-container"
        ref={provided.innerRef}
        {...provided.draggableProps}
      >
        <td
          width="40%"
          className="ref-subject-container est-td"
          style={{ paddingLeft: "3.85vw", paddingRight: "2.6vw" }}
        >
          {dragAndDrop ? (
            <span
              className="est-det-row-img dragAndDropImage"
              {...provided.dragHandleProps}
            ></span>
          ) : (
            <img
              src={
                quoteRow.isMatList === 1 && quoteRow.matList.length === 0
                  ? File_Loader
                  : isOpened
                  ? det
                  : Open
              }
              className="est-det-row-img"
              onClick={handleOpen}
            />
          )}
          <p className="list-subject">{quoteRow.name} </p>
          <p>{quoteRow.description}</p>
        </td>
        <td
          width="11%"
          style={{
            textAlign: "right",
            paddingRight: "2.6vw",
            verticalAlign: "top",
          }}
        >
          {(quoteRow.qty || 0).toLocaleString(navigator.language, {
            minimumFractionDigits: 0,
          })}
        </td>
        <td
          width="13%"
          style={{
            textAlign: "right",
            paddingRight: "2.6vw",
            verticalAlign: "top",
          }}
        >
          {(quoteRow.isMatList === 1 && quoteRow.matList.length > 0
            ? ((quoteRow.total || 0) + (quoteRow.discount || 0)) /
              (quoteRow.qty || 1)
            : quoteRow.unitPrice || 0
          ).toLocaleString(navigator.language, {
            minimumFractionDigits: 2,
          })}
        </td>
        <td
          width="11%"
          style={{
            textAlign: "right",
            paddingRight: "2.6vw",
            verticalAlign: "top",
          }}
        >
          {(quoteRow.discount || 0).toLocaleString(navigator.language, {
            minimumFractionDigits: 2,
          })}
        </td>
        <td
          width="8%"
          style={{
            textAlign: "right",
            paddingRight: "2.6vw",
            verticalAlign: "top",
          }}
        >
          {quoteRow.tax} %
        </td>
        <td
          width="17%"
          style={{
            textAlign: "right",
            paddingRight: "2.6vw",
            verticalAlign: "top",
          }}
        >
          {(quoteRow.total || 0).toLocaleString(navigator.language, {
            minimumFractionDigits: 2,
          })}
        </td>
      </tr>
      {isOpened && quoteRow.isMatList === 1 && quoteRow.matList.length > 0 && (
        <tr className="task-list-row-container">
          <td width="100%" style={{ paddingLeft: "3.85vw" }}>
            <QuoteMaterialDetails matList={quoteRow.matList} />
          </td>
        </tr>
      )}
      {!isLast && (
        <tr className="empty-row-container">
          <td width="100%" className="border-td" colSpan="8">
            <div></div>
          </td>
        </tr>
      )}
    </>
  );
};

export default QuoteRow;
