import React, { Component, useEffect, useState } from "react";
import { getTimeDifference } from "../../common/commonOperation";
import Gap from "../../common/Gap";
import RecentEstimateOpened from "./RecentEstimateOpened";
import RecentEstimateUpdated from "./RecentEstimateUpdated";
import _ from "lodash";

const RecentEstimateDetails = ({ rightContent, data, handleRecentClick }) => {
  const [recentUpdated, setRecentUpdated] = useState([]);
  const [recentOpened, setRecentOpened] = useState([]);

  useEffect(() => {
    if (!data || data.length <= 0) {
      setRecentOpened([]);
      setRecentUpdated({});
      return;
    }
    let recentOpenedData = [...data]
      .sort(
        (a, b) => new Date(b.opened).valueOf() - new Date(a.opened).valueOf()
      )
      .slice(0, 5)
      .map((d) => {
        return {
          estID: d.estID,
          projName: d.projName,
          customer: d.customer,
          amount: d.amount,
        };
      });
    setRecentOpened(recentOpenedData);

    let recentUpdated = [...data]
      .sort(
        (a, b) => new Date(b.updated).valueOf() - new Date(a.updated).valueOf()
      )
      .slice(0, 5)
      .map((d) => {
        return {
          estID: d.estID,
          projName: d.projName,
          customer: d.customer,
          status: d.status,
          updated: d.updated,
          key: getTimeDifference(
            d.updated.replace("T", " ").replace("Z", ""),
            "estimate"
          ),
        };
      });
    let grouped = _.mapValues(_.groupBy(recentUpdated, "key"), (elist) =>
      elist.map((est) => _.omit(est, "key"))
    );
    setRecentUpdated(grouped);
  }, [rightContent, data]);

  return (
    rightContent === "Recent Estimation Status" && (
      <div className="task-details-box">
        <RecentEstimateUpdated
          data={recentUpdated}
          handleRecentClick={handleRecentClick}
        />
        <Gap />
        <RecentEstimateOpened
          data={recentOpened}
          handleRecentClick={handleRecentClick}
        />
      </div>
    )
  );
};

export default RecentEstimateDetails;
