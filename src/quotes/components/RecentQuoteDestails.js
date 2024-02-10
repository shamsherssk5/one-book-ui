import React, { Component, useEffect, useState } from "react";
import { getTimeDifference } from "../../common/commonOperation";
import Gap from "../../common/Gap";
import _ from "lodash";
import RecentQuoteUpdated from "./RecentQuoteUpdated";
import RecentQuoteOpened from "./RecentQuoteOpened";

const RecentQuoteDetails = ({ rightContent, data, handleRecentClick }) => {
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
          quoteID: d.quoteID,
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
          quoteID: d.quoteID,
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
      elist.map((quote) => _.omit(quote, "key"))
    );
    setRecentUpdated(grouped);
  }, [rightContent, data]);

  return (
    rightContent === "Recent Quote Status" && (
      <div className="task-details-box">
        <RecentQuoteUpdated
          data={recentUpdated}
          handleRecentClick={handleRecentClick}
        />
        <Gap />
        <RecentQuoteOpened
          data={recentOpened}
          handleRecentClick={handleRecentClick}
        />
      </div>
    )
  );
};

export default RecentQuoteDetails;
