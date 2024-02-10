import { result } from "lodash";
import React, { useEffect } from "react";
import { useState } from "react";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import Gap from "../../common/Gap";
import { parseFloatEst } from "../parseFloatEst";
import EstimateCategory from "./EstimateCategory";
import EstimateCostProfit from "./EstimateCostProfit";

const EstimationCreateInfo = ({
  rightContent,
  stats,
  setToken,
  files,
  setFiles,
  editOrRevise,
  updateCat,
  materials,
  setMaterials,
  isModuleRestricted,
}) => {
  const [categroies, setCategories] = useState([]);
  const handleDelete = (id) => {
    setFiles((prev) => {
      let f = prev.filter((file) => file.fileID !== id);
      return f;
    });
  };

  const handleUpload = (file) => {
    setFiles((prev) => {
      return [...prev, file];
    });
  };

  useEffect(() => {
    if (stats && stats.categories) {
      var result = [];
      stats.categories.reduce((res, value) => {
        if (!res[value.category]) {
          res[value.category] = {
            category: value.category,
            margin: stats.categories
              .filter((cat) => cat.category === value.category)
              .every((cat) => cat.margin === value.margin)
              ? value.margin
              : "",
            cost: 0,
            sellingPrice: 0,
          };
          result.push(res[value.category]);
        }
        res[value.category].cost =
          parseFloatEst(res[value.category].cost) + parseFloatEst(value.cost);
        res[value.category].sellingPrice =
          parseFloatEst(res[value.category].sellingPrice) +
          parseFloatEst(value.sellingPrice);
        return res;
      }, {});

      let fixed = result.find((res) => res.category === "Fixed");
      let UnSpecified = result.find((res) => res.category === "UnSpecified");
      result = result.filter(
        (res) => !["Fixed", "UnSpecified"].includes(res.category)
      );
      if (UnSpecified) {
        result = [...result, UnSpecified];
      }
      if (fixed) {
        result = [...result, fixed];
      }
      setCategories(result);
    }
  }, [stats.categories]);

  return (
    rightContent === "Cost & Profit" && (
      <div className="task-details-box">
        {!isModuleRestricted && (
          <>
            <EstimateCostProfit stats={stats} />
            <Gap />
            <EstimateCategory
              categories={categroies}
              updateCat={updateCat}
              currency={stats.currency}
              materials={materials}
              setMaterials={setMaterials}
              setToken={setToken}
            />
          </>
        )}
        {!editOrRevise && (
          <>
            {!isModuleRestricted && <Gap />}
            <FileUploaderListViewer
              isView={false}
              setToken={setToken}
              data={files}
              handleUpload={handleUpload}
              handleDelete={handleDelete}
              module="est"
              id={undefined}
            />
          </>
        )}
      </div>
    )
  );
};

export default EstimationCreateInfo;
