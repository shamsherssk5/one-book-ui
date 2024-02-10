import React, { useEffect, useState } from "react";
import PhonebookHome from "./PhonebookHome";
import make_preferred from "../assets/make_preferred.png";
import make_not_preferred from "../assets/make_not_preferred.png";
import StarRatings from "react-star-ratings";
import Sort from "../../tasks/assets/sort.png";
import subject_sort from "../../tasks/assets/subject-sort.png";
import axios from "axios";
import toast from "react-hot-toast";

const PhonebookListItems = ({
  currentItems,
  setData,
  setSelectData,
  selectData,
  setRightContent,
  moveToPreferred,
  setMoveToPreferred,
  addToSupplier,
  setAddToSupplier,
  setToken,
  deleteTrigger,
  setDeleteTrigger,
}) => {
  const handleOnchange = (e) => {
    let isAllChecked = currentItems.every(
      (d) => document.getElementById(d.ID).checked
    );
    if (isAllChecked) {
      document.getElementById("all").checked = true;
    } else {
      document.getElementById("all").checked = false;
    }
  };

  const changeRating = async (rating, ID) => {
    setData((prev) => {
      let updatedPhoneBook = prev.filter((p) => {
        if (p.ID === ID) {
          p.rating = rating;
        }
        return p;
      });
      return updatedPhoneBook;
    });

    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/phoneBook/update-rating",
        { rating: rating, ID: ID },
        { headers: { Authorization: window.localStorage.getItem("token") } }
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

  const changeCategory = async (IDs, category, change) => {
    if (change) {
      setData((prev) => {
        let updatedPhoneBook = prev.filter((p) => {
          if (IDs.toString().split(",").includes(p.ID.toString())) {
            p.category = category;
          }
          return p;
        });
        return updatedPhoneBook;
      });
    }

    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/phoneBook/update-category",
        { category: category, IDs: IDs },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }

        if (!change) {
          setData((prev) => {
            let updatedPhoneBook = prev.filter((p) => {
              if (IDs.toString().split(",").includes(p.ID.toString())) {
                p.category = category;
              }
              return p;
            });
            return updatedPhoneBook;
          });
          toast.success("Contact Moved successfully");
        }
        document.body.click();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Contact Movement Failed");
      });
  };

  useEffect(async () => {
    if (deleteTrigger) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.ID).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select atleast one Customer Using Checkbox");
        setDeleteTrigger();
      } else {
        let IDs =
          checkedItem.length === 1
            ? checkedItem.map((cust) => cust.ID)[0]
            : checkedItem.map((cust) => cust.ID).join();

        await axios
          .post(
            process.env.REACT_APP_API_ENDPOINT + "/phoneBook/delete-contact",
            { IDs: IDs },
            { headers: { Authorization: window.localStorage.getItem("token") } }
          )
          .then((res) => {
            if (res.data.error) {
              setToken(undefined);
            }
            setData((prev) => {
              let updatedData = prev.filter(
                (cust) =>
                  !IDs.toString().split(",").includes(cust.ID.toString())
              );
              return updatedData;
            });
            toast.success("Contact(s) deleted Successfully");
            document.body.click();
          })
          .catch((err) => {
            console.log(err);
            toast.error("Contact(s) deletion failed");
          });

        setDeleteTrigger();
      }
    }
  }, [deleteTrigger]);

  useEffect(() => {
    if (moveToPreferred) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.ID).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select atleast one Item Using Checkbox");
        setMoveToPreferred();
      } else {
        let IDs =
          checkedItem.length === 1
            ? checkedItem.map((cust) => cust.ID)[0]
            : checkedItem.map((cust) => cust.ID).join();
        changeCategory(IDs, moveToPreferred);
        setMoveToPreferred();
      }
    }
  }, [moveToPreferred]);

  useEffect(async () => {
    if (addToSupplier) {
      let checkedItem = currentItems.filter(
        (item) => document.getElementById(item.ID).checked
      );
      if (checkedItem.length === 0) {
        toast.error("Please Select atleast one Item Using Checkbox");
        setAddToSupplier();
      } else {
        let IDs =
          checkedItem.length === 1
            ? checkedItem.map((cust) => cust.ID)[0]
            : checkedItem.map((cust) => cust.ID).join();

        await axios
          .post(
            process.env.REACT_APP_API_ENDPOINT +
              "/phoneBook/copy-contact-supplier",
            { IDs: IDs },
            { headers: { Authorization: window.localStorage.getItem("token") } }
          )
          .then((res) => {
            if (res.data.error) {
              setToken(undefined);
            }
            toast.success("Contact(s) added Successfully to Suppliers");
            document.body.click();
            setToInitial();
          })
          .catch((err) => {
            console.log(err);
            toast.error("Contact(s) addition failed");
          });
        setAddToSupplier();
      }
    }
  }, [addToSupplier]);

  const [sort, setSort] = useState("");
  useEffect(() => {
    if (sort == "") return;
    setData((prev) => {
      let sortedData = [...prev];
      switch (sort) {
        case "rating":
          sortedData.sort((a, b) => a.rating - b.rating);
          break;
        case "rating-dec":
          sortedData.sort((a, b) => b.rating - a.rating);
          break;
        case "contactPerson":
          sortedData.sort((a, b) =>
            a.contactPerson.localeCompare(b.contactPerson)
          );
          break;
        case "contactPerson-dec":
          sortedData.sort((a, b) =>
            b.contactPerson.localeCompare(a.contactPerson)
          );
          break;
        case "companyName":
          sortedData.sort((a, b) => a.companyName.localeCompare(b.companyName));
          break;
        case "companyName-dec":
          sortedData.sort((a, b) => b.companyName.localeCompare(a.companyName));
          break;
        default:
          break;
      }
      return sortedData;
    });
  }, [sort]);

  const handleCheckAll = (e) => {
    currentItems.forEach((element) => {
      document.getElementById(element.ID).checked = e.target.checked;
    });
  };

  useEffect(() => {
    if (currentItems == null) return;
    setToInitial();
  }, [currentItems]);

  const setToInitial = () => {
    document.getElementById("all").checked = false;
    currentItems.forEach((element) => {
      document.getElementById(element.ID).checked = false;
    });
  };

  return (
    <div className="list-container-box">
      {currentItems != null && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <table className="list-view-table">
            <thead className="thead-class">
              <tr className="list-view-header-row">
                <th width="3.6%">
                  <input
                    id="all"
                    className="chkbx"
                    name="all"
                    type="checkbox"
                    onChange={handleCheckAll}
                  />
                </th>
                <th
                  width="25.57%"
                  onClick={() =>
                    sort == "companyName"
                      ? setSort("companyName-dec")
                      : setSort("companyName")
                  }
                >
                  Company Name
                  <img
                    title="sort"
                    className={
                      sort == "companyName" ? "sort sort-flip" : "sort"
                    }
                    src={subject_sort}
                  />
                </th>
                <th
                  width="17.70%"
                  onClick={() =>
                    sort == "contactPerson"
                      ? setSort("contactPerson-dec")
                      : setSort("contactPerson")
                  }
                >
                  Contact Person
                  <img
                    title="sort"
                    className={
                      sort == "contactPerson" ? "sort sort-flip" : "sort"
                    }
                    src={Sort}
                  />
                </th>
                <th width="15.63%">Contact Number</th>
                <th width="21.91%">Key Words</th>
                <th
                  width="10.80%"
                  onClick={() =>
                    sort == "rating" ? setSort("rating-dec") : setSort("rating")
                  }
                >
                  Rating
                  <img
                    title="sort"
                    className={sort == "rating" ? "sort sort-flip" : "sort"}
                    src={Sort}
                  />
                </th>
                <th width="4.29%"></th>
              </tr>
            </thead>
            <tbody className="tbody-class">
              {currentItems.map((cust, index) => {
                return (
                  <>
                    <tr
                      key={index}
                      className="task-list-row-container"
                      onClick={(e) => {
                        let className = e.target.className;
                        if (
                          className === "chk-box-container-td" ||
                          className === "chkbx"
                        )
                          return;
                        setSelectData(cust);
                        setRightContent("Details");
                      }}
                      style={{
                        backgroundColor:
                          cust.ID === selectData.ID ? "#E5F1FA" : "",
                      }}
                    >
                      <td width="3.6%" className="chk-box-container-td">
                        <input
                          className="chkbx"
                          name={cust.ID}
                          id={cust.ID}
                          type="checkbox"
                          onChange={handleOnchange}
                        />
                      </td>
                      <td width="25.57%" className="ref-subject-container">
                        <p>
                          {cust.refText} {cust.refNum}
                        </p>
                        <p className="list-subject">{cust.companyName}</p>
                      </td>
                      <td width="17.70%">{cust.contactPerson}</td>
                      <td width="15.63%" className="ref-subject-container">
                        {cust.contactNumber
                          .split(",")
                          .filter((x) => x !== "")
                          .map((m) => (
                            <p>+{m}</p>
                          ))}
                      </td>
                      <td width="21.91%">{cust.keyWords}</td>
                      <td width="10.80%">
                        <StarRatings
                          rating={cust.rating}
                          starDimension="0.83vw"
                          starSpacing="0.1vw"
                          starRatedColor="#44B764"
                          starEmptyColor="#C4C4C4"
                          changeRating={(rating, name) =>
                            changeRating(rating, cust.ID)
                          }
                          numberOfStars={5}
                          name="rating"
                        />
                      </td>
                      <td width="4.29%">
                        <img
                          className="thumb"
                          src={
                            cust.category === "preferred"
                              ? make_preferred
                              : make_not_preferred
                          }
                          title={
                            cust.category === "preferred"
                              ? "Make Not Preferred"
                              : "Make Preferred"
                          }
                          onClick={() =>
                            changeCategory(
                              cust.ID,
                              cust.category === "preferred"
                                ? "Non preferred"
                                : "preferred",
                              true
                            )
                          }
                        />
                      </td>
                    </tr>
                    <tr className="empty-row-container">
                      <td width="100%" className="border-td" colSpan="8">
                        <div></div>
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PhonebookListItems;
