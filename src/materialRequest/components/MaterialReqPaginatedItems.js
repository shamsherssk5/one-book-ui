import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import "../../tasks/css/taskPagination.css";
import next from "../../tasks/assets/next.png";
import prev from "../../tasks/assets/prev.png";
import MaterialReqListItems from "./MaterialReqListItems";

const MaterialReqPaginatedItems = ({
  itemsPerPage,
  setItemsPerPage,
  items,
  setData,
  selectData,
  setSelectData,
  setRightContent,
  deleteTrigger,
  setDeleteTrigger,
  setToken,
  menuButton,
  setMenuButton,
  setRefresh,
}) => {
  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    if (items.length <= 0) {
      setCurrentItems([]);
      setPageCount(1);
      setItemOffset(0);
      return;
    }
    const endOffset = itemOffset + itemsPerPage;
    let newItems = items.slice(itemOffset, endOffset);
    setCurrentItems(newItems);
    setPageCount(Math.ceil(items.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, items]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    setItemOffset(newOffset);
  };

  return (
    <>
      <MaterialReqListItems
        currentItems={currentItems}
        setData={setData}
        selectData={selectData}
        setSelectData={setSelectData}
        setRightContent={setRightContent}
        deleteTrigger={deleteTrigger}
        setDeleteTrigger={setDeleteTrigger}
        setToken={setToken}
        menuButton={menuButton}
        setRefresh={setRefresh}
        setMenuButton={setMenuButton}
      />

      <div className="paging-container">
        <div className="paging-container-box">
          <table className="table-paginge-container">
            <tbody>
              <tr>
                <td className="items-count" width="1%">
                  <select
                    className="items-select"
                    onChange={(e) => {
                      setItemsPerPage(e.target.value);
                      setItemOffset(0);
                      setPageCount(1);
                    }}
                  >
                    {items.length >= 25 ? (
                      <option value="25" selected>
                        25
                      </option>
                    ) : (
                      <option value={items.length} selected>
                        {items.length}
                      </option>
                    )}
                    {items.length > 50 ? <option value="50">50</option> : ""}
                    {items.length > 100 ? <option value="100">100</option> : ""}
                  </select>
                  &nbsp;items
                </td>
                <td className="items-count page-num" width="1%">
                  Page {itemOffset / itemsPerPage + 1} of {pageCount}
                </td>
                <td align="right">
                  <ReactPaginate
                    breakLabel="..."
                    onPageChange={handlePageClick}
                    pageCount={pageCount}
                    nextLabel={
                      <button>
                        <span className="next-text">Next</span>{" "}
                        <img title="Next" className="next-button" src={next} />
                      </button>
                    }
                    previousLabel={
                      <button>
                        <img
                          title="Previous"
                          className="next-button"
                          src={prev}
                        />
                        <span className="prev-text">Prev</span>
                      </button>
                    }
                    renderOnZeroPageCount={null}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MaterialReqPaginatedItems;
