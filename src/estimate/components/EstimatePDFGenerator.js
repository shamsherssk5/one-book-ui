import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { parseFloatEst } from "../parseFloatEst";
import moment from "moment-timezone";
import { Country, State } from "country-state-city";
const generateEstPDF = (
  estimateRows,
  estimate,
  stats,
  subItemsRequired,
  logo,
  customer,
  organization,
  financialDetails,
  isModuleRestricted
) => {
  const result = estimateRows.some(
    (est) => est.isMatList === 1 && est.matList.length === 0
  );
  if (result) {
    toast.error("Please Wait...Estimate is Still Loading");
    return;
  }
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const doc = new jsPDF("p", "pt", "A4");

  let isDiscountrequired = estimateRows.some(
    (estRow) => estRow.discount && parseFloatEst(estRow.discount) > 0
  );

  let headers = [
    "Item & Description",
    "Qty",
    "Unit Price",
    "Tax (%)",
    "Amount(" + estimate.currency + ")",
  ];
  if (isDiscountrequired) {
    headers.splice(3, 0, "Discount");
  }

  let body = estimateRows.map((estRow) => {
    let row = [
      estRow.name + "\n\n" + estRow.description,
      estRow.qty,
      (estRow.isMatList === 1 && estRow.matList.length > 0
        ? ((estRow.total || 0) + (estRow.discount || 0)) / (estRow.qty || 1)
        : estRow.unitPrice || 0
      ).toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
      }),
      estRow.tax.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
      }),
      estRow.total.toLocaleString(navigator.language, {
        minimumFractionDigits: 2,
      }),
    ];
    if (isDiscountrequired) {
      row.splice(
        3,
        0,
        (estRow.discount || 0).toLocaleString(navigator.language, {
          minimumFractionDigits: 2,
        })
      );
    }
    return row;
  });
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.setFont("Arial", "bold");
  doc.text("ESTIMATION", 43, 40, { align: "left" });
  doc.setFontSize(12);
  doc.text("Ref Number ", 43, 60, { align: "left" });
  doc.setFont("Arial", "normal");
  doc.text(`(${estimate.refText}${estimate.refNum})`, 110, 60, {
    align: "left",
  });
  var img = new Image();
  img.src = logo;
  var type = logo.substring(logo.lastIndexOf(".") + 1, logo.length);
  doc.addImage(img, type, 495, 0, 100, 100, { align: "right" });
  doc.setFont("Arial", "bold");
  doc.text("To", 43, 101, { align: "left" });
  doc.setFont("Arial", "normal");
  doc.text(`${estimate.customer},`, 43, 114, { align: "left" });
  doc.setFont("Arial", "bold");
  doc.text(`Attn: ${estimate.contactName}`, 320, 114, { align: "left" });
  doc.setFont("Arial", "normal");
  doc.text(`Attn: ${estimate.contactEmail}`, 320, 127, { align: "left" });
  var strArr = doc.splitTextToSize(
    customer.address +
      "\n" +
      (customer.country
        ? State.getStateByCodeAndCountry(customer.state, customer.country).name
        : "") +
      "\n" +
      (customer.country ? Country.getCountryByCode(customer.country).name : ""),
    200
  );
  doc.text(strArr, 43, 127, { align: "left" });

  doc.setFont("Arial", "bold");
  doc.text(`Created Date`, 320, 153, { align: "left" });
  doc.text(`Expiry Date`, 405, 153, { align: "left" });
  doc.setFont("Arial", "normal");
  doc.text(
    `${moment(estimate.created.replace("T", " ").replace("Z", "")).format(
      currentUser.dateFormat
    )}`,
    320,
    166,
    { align: "left" }
  );
  doc.text(
    `${moment(estimate.created.replace("T", " ").replace("Z", ""))
      .add(1, "M")
      .format(currentUser.dateFormat)}`,
    405,
    166,
    { align: "left" }
  );
  doc.setFillColor("#cbeaf3");
  doc.rect(43, 219, 532, 26, "F");
  doc.setFont("Arial", "bold");
  doc.text(`Project: ${estimate.projName}`, 43, 235, { align: "left" });

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
    tableWidth: 532,
    bodyStyles: {
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0],
      valign: "top",
      fontSize: 12,
    },
    margin: { left: 43 },
    startY: 275,
    styles: { font: "Arial" },
    headStyles: {
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      valign: "bottom",
      fontSize: 11,
      fillColor: [255, 255, 255],
    },
    columnStyles: getColumnStyles(),
    didParseCell: (hookData) => {
      console.log(hookData);
      if (hookData.section === "head") {
        if (hookData.cell.raw === "Item & Description") {
          hookData.cell.styles.halign = "left";
        }
        if (hookData.cell.raw === "Qty") {
          hookData.cell.styles.halign = "center";
        }
        if (
          [
            "Unit Price",
            "Tax (%)",
            "Amount(" + estimate.currency + ")",

            "Discount",
          ].includes(hookData.cell.raw)
        ) {
          hookData.cell.styles.halign = "right";
        }
      }
    },
  });

  const materialHeaders = isModuleRestricted
    ? ["Product/Material Name", "Qty", "Unit Type"]
    : [
        "Product/Material Name",
        "Qty",
        "Unit Type",
        "Unit Cost",
        "Total Cost",
        "Mark Up %",
        "Selling Price",
      ];

  if (subItemsRequired) {
    estimateRows
      .filter((estimateRow) => estimateRow.isMatList === 1)
      .forEach((estimateRow, i) => {
        doc.setTextColor(0, 0, 0);
        doc.text(
          `Materials List for Item: ${estimateRow.name}`,
          40,
          doc.lastAutoTable.finalY + (i <= 0 ? 30 : 60)
        );

        let materialBody = estimateRow.matList.map((m) =>
          isModuleRestricted
            ? [m.name, m.units, m.unitType]
            : [
                m.name,
                m.units,
                m.unitType,
                (m.unitPrice || 0).toLocaleString(navigator.language, {
                  minimumFractionDigits: 2,
                }),
                (
                  parseFloatEst(m.units) * parseFloatEst(m.unitPrice) || 0
                ).toLocaleString(navigator.language, {
                  minimumFractionDigits: 2,
                }),
                m.margin,
                (m.sellingPrice || 0).toLocaleString(navigator.language, {
                  minimumFractionDigits: 2,
                }),
              ]
        );
        autoTable(doc, {
          head: [materialHeaders],
          body: materialBody,
          startY: doc.lastAutoTable.finalY + (i <= 0 ? 38 : 68),
          styles: { font: "Arial" },
          theme: "grid",
          overflow: "linebreak",
          bodyStyles: {
            lineColor: [0, 0, 0],
            textColor: [0, 0, 0],
            valign: "top",
            fontSize: 10,
          },
          headStyles: {
            halign: "center",
            textColor: [0, 0, 0],
            fillColor: [255, 255, 255],
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            valign: "middle",
            fontSize: 10,
          },
          columnStyles: {
            0: { cellWidth: 182, halign: "left" },
            1: { cellWidth: 43, halign: "center" },
            2: { cellWidth: 58, halign: "center" },
            3: { cellWidth: 48, halign: "right" },
            4: { cellWidth: 67, halign: "right" },
            5: { cellWidth: 63, halign: "right" },
            6: { cellWidth: 74, halign: "right" },
          },
        });
        if (!isModuleRestricted) {
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          if (isDiscountrequired) {
            doc.text(
              `Discount:     ${estimateRow.discount.toLocaleString(
                navigator.language,
                {
                  minimumFractionDigits: 2,
                }
              )}`,
              575,
              doc.lastAutoTable.finalY + 13,
              { align: "right" }
            );
          }
          doc.text(
            `Item Cost:     ${estimateRow.total.toLocaleString(
              navigator.language,
              {
                minimumFractionDigits: 2,
              }
            )}        Item Profit:     ${estimateRow.profit.toLocaleString(
              navigator.language,
              {
                minimumFractionDigits: 2,
              }
            )}`,
            575,
            doc.lastAutoTable.finalY + 26 - (isDiscountrequired ? 0 : 13),
            { align: "right" }
          );
        }
      });
  }
  doc.setFontSize(12);
  let finalY = doc.lastAutoTable.finalY + (subItemsRequired ? 12 : 0);
  const pageHeight = doc.internal.pageSize.getHeight();
  if (finalY + 100 > pageHeight) {
    doc.addPage();
    finalY = 40;
  }
  doc.setDrawColor(0, 0, 0);
  doc.setFont("Arial", "normal");
  doc.line(43, finalY + 12, 575, finalY + 12);
  let y = finalY + 30;
  doc.text(
    `${getamountText("Sub Total")}${getAmount(stats.netTotal)}`,
    575,
    y,
    {
      align: "right",
    }
  );
  doc.text(
    `${getamountText(`Total Vat(${estimate.taxPercentage}%)`)}${getAmount(
      stats.totalTax
    )}`,
    575,
    y + 20,
    {
      align: "right",
    }
  );
  doc.line(375, y + 32, 575, y + 32);
  doc.setFont("Arial", "bold");
  doc.text(
    `${getamountText("Total Amount")}${getAmount(stats.grandTotal)}`,
    575,
    y + 48,
    {
      align: "right",
    }
  );

  let amountY = y + 48;
  if (amountY + 100 > pageHeight) {
    doc.addPage();
    amountY = 40;
  }
  doc.setFillColor("#000000");
  doc.rect(43, amountY + 12, 532, 2, "F");
  doc.text("Notes", 43, amountY + 30, {
    align: "left",
  });
  doc.line(43, amountY + 40, 575, amountY + 40);
  doc.setFont("Arial", "normal");
  var note = doc.splitTextToSize(estimate.additionalNotes, 200);
  doc.text(note, 43, amountY + 56, {
    align: "left",
  });
  let noteY = amountY + 128;
  if (noteY + 100 > pageHeight) {
    doc.addPage();
    noteY = 40;
  }
  doc.setFont("Arial", "bold");
  doc.text("Terms & Conditions", 43, noteY, {
    align: "left",
  });
  doc.line(43, noteY + 10, 575, noteY + 10);
  doc.setFont("Arial", "normal");
  const tnc = doc.splitTextToSize(
    "Installation cost is not included,Shipment and custom duty will be paid by the client.",
    200
  );
  doc.text(tnc, 43, noteY + 26, {
    align: "left",
  });

  if (noteY + 140 > pageHeight) {
    doc.addPage();
  }

  let footerY = doc.internal.pageSize.getHeight() - 75;

  doc.line(43, footerY, 575, footerY);

  doc.text(
    `${(organization.address || "").replace("\n", " ")} | ${
      organization.country
        ? State.getStateByCodeAndCountry(
            organization.state,
            organization.country
          ).name
        : ""
    } | ${
      organization.country
        ? Country.getCountryByCode(organization.country).name
        : ""
    }\n+${organization.telnumber} | ${organization.emailId}\nTRN : ${
      financialDetails.taxNo
    }`,
    287.5,
    footerY + 15,
    {
      align: "center",
    }
  );

  return doc;
};
const getAmount = (amount) => {
  var string = (amount || 0).toLocaleString(navigator.language, {
    minimumFractionDigits: 2,
  });
  return string.padStart(20, " ");
};

const getamountText = (text) => {
  return text.padEnd(15, " ");
};

export default generateEstPDF;
