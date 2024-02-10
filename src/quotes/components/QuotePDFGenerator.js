import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { parseFloatEst } from "../../estimate/parseFloatEst";
import moment from "moment-timezone";
const generateQuotePDF = (quoteRows, qoute, stats, subItemsRequired, logo) => {
  const result = quoteRows.some(
    (qoute) => qoute.isMatList === 1 && qoute.matList.length === 0
  );
  if (result) {
    toast.error("Please Wait...Qoute is Still Loading");
    return;
  }
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const doc = new jsPDF("p", "pt", "A4");

  let isDiscountrequired = quoteRows.some(
    (qouteRow) => qouteRow.discount && parseFloatEst(qouteRow.discount) > 0
  );

  let headers = [
    "Item & Description",
    "Qty",
    "Unit Price",
    "Tax (%)",
    "Amount(" + qoute.currency + ")",
  ];
  if (isDiscountrequired) {
    headers.splice(3, 0, "Discount");
  }

  let body = quoteRows.map((qouteRow) => {
    let row = [
      qouteRow.name + "\n\n" + qouteRow.description,
      qouteRow.qty,
      (qouteRow.isMatList === 1 && qouteRow.matList.length > 0
        ? ((qouteRow.total || 0) + (qouteRow.discount || 0)) /
          (qouteRow.qty || 1)
        : qouteRow.unitPrice || 0
      ).toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
      }),
      qouteRow.tax.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
      }),
      qouteRow.total.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
      }),
    ];
    if (isDiscountrequired) {
      row.splice(
        3,
        0,
        (qouteRow.discount || 0).toLocaleString(navigator.language, {
          minimumFractionDigits: 2,
        })
      );
    }
    return row;
  });
  doc.setFontSize(9);
  doc.setTextColor(53, 58, 66);
  doc.text(`${qoute.refText}${qoute.refNum}`, 40, 30, { align: "left" });
  doc.setFontSize(10);
  doc.setTextColor(24, 122, 203);
  doc.text(`Project Name: ${qoute.projName}`, 40, 45, { align: "left" });
  doc.setFontSize(9);
  doc.setTextColor(53, 58, 66);
  doc.text(`Customer: ${qoute.customer}`, 40, 60, { align: "left" });
  doc.text(
    `Quoted By: ${qoute.createdBy} on ${moment(
      qoute.created.replace("T", " ").replace("Z", "")
    ).format(
      currentUser.dateFormat +
        (currentUser.timeFormat === "12 Hrs" ? " hh:mm A" : " HH:mm")
    )}`,
    40,
    75,
    {
      align: "left",
    }
  );
  var img = new Image();
  img.src = logo;
  var type = logo.substring(logo.lastIndexOf(".") + 1, logo.length);
  doc.addImage(img, type, 495, -5, 100, 100, { align: "right" });

  const getColumnStyles = () => {
    if (isDiscountrequired) {
      return {
        0: { cellWidth: 229 },
        1: { cellWidth: 40, halign: "center" },
        2: { cellWidth: 67, halign: "right" },
        3: { cellWidth: 55, halign: "right" },
        4: { cellWidth: 53, halign: "right" },
        5: { cellWidth: 91, halign: "right" },
      };
    } else {
      return {
        0: { cellWidth: 240 },
        1: { cellWidth: 51, halign: "center" },
        2: { cellWidth: 78, halign: "right" },
        3: { cellWidth: 64, halign: "right" },
        4: { cellWidth: 102, halign: "right" },
      };
    }
  };

  autoTable(doc, {
    head: [headers],
    body: body,
    theme: "grid",
    overflow: "linebreak",
    bodyStyles: {
      lineColor: [196, 196, 196],
      textColor: [53, 58, 66],
      valign: "top",
      fontSize: 10,
    },
    startX: 0,
    startY: 90,
    styles: { font: "Arial" },
    headStyles: {
      halign: "center",
      textColor: [24, 122, 203],
      fillColor: [241, 241, 241],
      lineWidth: 0.1,
      lineColor: [196, 196, 196],
      valign: "middle",
      fontSize: 10,
    },
    columnStyles: getColumnStyles(),
  });

  const materialHeaders = ["Product/Material Name", "Qty", "Unit Type"];

  if (subItemsRequired) {
    quoteRows
      .filter((qouteRow) => qouteRow.isMatList === 1)
      .forEach((qouteRow, i) => {
        doc.setTextColor(0, 0, 0);
        doc.text(
          `Materials List for Item: ${qouteRow.name}`,
          40,
          doc.lastAutoTable.finalY + (i <= 0 ? 30 : 60)
        );

        let materialBody = qouteRow.matList.map((m) => [
          m.name,
          m.units,
          m.unitType,
        ]);
        autoTable(doc, {
          head: [materialHeaders],
          body: materialBody,
          startY: doc.lastAutoTable.finalY + (i <= 0 ? 38 : 68),
          styles: { font: "Arial" },
          theme: "grid",
          overflow: "linebreak",
          bodyStyles: {
            lineColor: [196, 196, 196],
            textColor: [53, 58, 66],
            valign: "top",
            fontSize: 9,
          },
          headStyles: {
            halign: "center",
            textColor: [24, 122, 203],
            fillColor: [255, 255, 255],
            lineWidth: 0.1,
            lineColor: [196, 196, 196],
            valign: "middle",
            fontSize: 9,
          },
          columnStyles: {
            0: { cellWidth: 182, halign: "left" },
            1: { cellWidth: 43, halign: "center" },
            2: { cellWidth: 58, halign: "center" },
          },
        });
      });
  }

  let finalY = doc.lastAutoTable.finalY;
  doc.setDrawColor(53, 58, 66);
  doc.line(20, finalY + 50, 575, finalY + 50);

  let y = finalY + 64;

  doc.setFontSize(10);
  doc.text(
    `Total:    ${(stats.total || 0).toLocaleString(navigator.language, {
      minimumFractionDigits: 2,
    })}`,
    575,
    y,
    { align: "right" }
  );

  if (isDiscountrequired) {
    doc.text(
      `Discount:    ${(stats.discount || 0).toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
      })}`,
      575,
      y + 14,
      { align: "right" }
    );
  }
  doc.text(
    `Net Total:    ${(stats.netTotal || 0).toLocaleString(navigator.language, {
      minimumFractionDigits: 2,
    })}`,
    575,
    y + 28 - (isDiscountrequired ? 0 : 14),
    { align: "right" }
  );
  doc.text(
    `Total Tax:    ${(stats.totalTax || 0).toLocaleString(navigator.language, {
      minimumFractionDigits: 2,
    })}`,
    575,
    y + 42 - (isDiscountrequired ? 0 : 14),
    { align: "right" }
  );
  doc.text(
    `Grand Total Amount:    ${(stats.grandTotal || 0).toLocaleString(
      navigator.language,
      {
        minimumFractionDigits: 2,
      }
    )}`,
    575,
    y + 56 - (isDiscountrequired ? 0 : 14),
    { align: "right" }
  );

  return doc;
};
export default generateQuotePDF;
