import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import "../../tasks/css/taskPagination.css";
import Next from "../../tasks/assets/next.png";
import Prev from "../../tasks/assets/prev.png";
import MaterialListItems from "./MaterialListItems";
import VendorListItems from "./VendorListItems";

const MaterialPaginatedItems = ({
  itemsPerPage,
  items,
  setData,
  setItemsPerPage,
  setView,
  setCurrentMaterial,
  currentMaterial,
  setRightContent,
  deleteMaterial,
  setDeleteMaterial,
	handleDeleteMaterial,
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
      <MaterialListItems
        currentItems={currentItems}
        setData={setData}
        setView={setView}
        setCurrentMaterial={setCurrentMaterial}
        currentMaterial={currentMaterial}
        setRightContent={setRightContent}
        deleteMaterial={deleteMaterial}
        setDeleteMaterial={setDeleteMaterial}
				handleDeleteMaterial={handleDeleteMaterial}

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
                        <img title="Next" className="next-button" src={Next} />
                      </button>
                    }
                    previousLabel={
                      <button>
                        <img
                          title="Previous"
                          className="next-button"
                          src={Prev}
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

export default MaterialPaginatedItems;
