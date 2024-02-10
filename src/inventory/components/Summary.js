import { useEffect, useState } from "react";
import DonutChart from 'react-donut-chart';
import Gap from "../../common/Gap";
import In_Stock from "../assets/instock.png";
import LOW_Stock from "../assets/lowstock.png";

const Summary = ({ rightContent, data, setData, menuButton}) => {
    const LOW_COUNT=1;
    const headers = {
        "stock": "Materials in Stock",
        "storage": "Storage (Rental)",
        "others": "Others"
    }
    const [types, setTypes] = useState([]);

    useEffect(() => {
        setTypes(new Set(data.map(d => d.menu)));
    }, [data])

    const handleStockClick=(stock)=>{

        if(menuButton!=='all' && menuButton!=='stock'){
            return;
        }
        if(stock==="out" && data.filter(d=> (d.menu === "stock" && (menuButton === 'all' || menuButton==="stock")) && (!d.iqty || parseInt(d.iqty)===0)).length>0)
            setData(data.filter(d=> (d.menu === "stock" && (menuButton === 'all' || menuButton==="stock")) && (!d.iqty || parseInt(d.iqty)===0)));
        else if(stock==="low" && data.filter(d=> (d.menu === "stock" && (menuButton === 'all' || menuButton==="stock")) && (d.iqty && parseInt(d.iqty)<=LOW_COUNT)).length>0)
            setData(data.filter(d=> (d.menu === "stock" && (menuButton === 'all' || menuButton==="stock")) && (d.iqty && parseInt(d.iqty)<=LOW_COUNT)));
    }   
    return (
        rightContent === "Product Alerts" &&
        <div className="task-details-box">
            <div className="task-details-container">
                <div className="details-container">
                    <div className='user-details-container'>
                        <table className="equalDivide" cellPadding="0" cellSpacing="0" width="100%" border="0">
                            <tbody className="table-heading">
                                <tr >
                                    <td width="18%">
                                        <img className="stock_in_img" src={In_Stock} onClick={()=>handleStockClick("out")}/>
                                    </td>
                                    <td width="40%">Out of stock</td>
                                    <td width="42%" align="right">{data.filter((d) => (d.menu === "stock" && (menuButton === 'all' || menuButton==="stock")) && (!d.iqty || parseInt(d.iqty)===0)).length}</td>

                                </tr>
                                <tr/>
                                <tr>
                                    <td>
                                    <img className="stock_low_img"src={LOW_Stock} onClick={()=>handleStockClick("low")}/>
                                    </td>
                                    <td>Low Stock</td>
                                    <td align="right">{data.filter(d=> (d.menu === "stock" && (menuButton === 'all' || menuButton==="stock")) && (d.iqty && parseInt(d.iqty)<=LOW_COUNT)).length}</td>
                                </tr>
                                <tr/>
                                <tr/>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Gap />
            <div className="messages task-details-container">
                <div className="message-Heading">
                    Summary
                </div>
            </div>
            <div className="empty-details-container blue-border"></div>
            {data.length > 0 && <><div className="task-details-container">
                <table className="equalDivide" cellPadding="0" cellSpacing="0" width="100%" border="0">
                    <tbody>
                        {
                            [...types].map(type =>
                                <>
                                    <tr>
                                        <td className="table-heading category-dark">{headers[type]}</td>
                                        <td className="table-heading category-dark" align="right">Value</td>
                                    </tr>
                                    <tr>
                                        <td className="table-heading">{data.filter((d) => d.menu === type).length} Item(s)</td>
                                        <td className="table-heading" align="right">{data.filter(d => d.menu === type).map(d => d.itotal?parseInt(d.itotal):0).reduce((a, c) => a + c, 0)}</td>
                                    </tr>
                                    <tr></tr>
                                </>
                            )
                        }
                    </tbody>
                </table>
            </div>
                <div className="task-details-container">
                    <div className="cust-chart-container">
                        <DonutChart
                            height={0.13 * window.innerWidth}
                            width={0.13 * window.innerWidth}
                            legend={false}
                            colors={["#85C5F3", "#187ACB", "#2687D7"]}
                            strokeColor={"black"}
                            selectedOffset={0.009}
                            formatValues={(value, total) => `${value === 0 ? total : value} AED`}
                            data={[{ label: "TOTAL VALUE", value: 0 }, ...[...types].map(type => {
                                return {
                                    label: headers[type],
                                    value: data.filter(d => d.menu === type).map(d => d.itotal?parseInt(d.itotal):0).reduce((a, c) => a + c, 0)
                                }
                            })]
                            } />
                    </div>
                </div>
            </>
            }
        </div>
    );

}

export default Summary;