import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { useD3 } from './useD3';

const BarChart = ({data}) => {

    useEffect(()=>{
        d3.select("rect.bar:last-child").style("fill","#94C9EF");
    })
    const ref = useD3(
        (svg) => {
            const height = window.innerHeight*0.17;
            const width = window.innerWidth*0.2;
            const margin = { top: 0, right: 0, bottom: 0, left: 0 };

            const x = d3
                .scaleBand()
                .domain(data.map((d) => d.col))
                .rangeRound([margin.left, width - margin.right])
                .padding(0.15);

            const y1 = d3
                .scaleLinear()
                .domain([0, d3.max(data, (d) => d.value)])
                .rangeRound([height - margin.bottom, margin.top]);

            const xAxis = (g) =>
                g.attr("transform", `translate(0,${height - 6})`).call(
                    d3
                        .axisBottom(x)
                        // .tickValues(
                        //     d3
                        //         .ticks(...d3.extent(x.domain()), width / 10)
                        //         .filter((v) => x(v) !== undefined)
                        // )
                        // .tickSizeOuter(0)
                );

            // const y1Axis = (g) =>
            //     g
            //         .attr("transform", `translate(${margin.left},0)`)
            //         .style("color", "steelblue")
            //         .call(d3.axisLeft(y1).ticks(null, "s"))
            //         .call((g) => g.select(".domain").remove())
            //         .call((g) =>
            //             g
            //                 .append("text")
            //                 .attr("x", -margin.left)
            //                 .attr("y", 10)
            //                 .attr("fill", "currentColor")
            //                 .attr("text-anchor", "start")
            //                 .text(data.y1)
            //         );

            svg.select(".x-axis").call(xAxis);
            // svg.select(".y-axis").call(y1Axis);

            svg
                .select(".plot-area")
                .attr("fill", "#C4C4C4")
                .selectAll(".bar")
                .data(data)
                .join("rect")
                .attr("class", "bar")
                .attr("x", (d) => x(d.col))
                .attr("width", x.bandwidth())
                .attr("y", (d) => y1(d.value))
                .on("click", (d, i)=>{
                   d3.selectAll("rect.bar").style("fill", "#C4C4C4")
                   d3.select(d.srcElement).style("fill", "#94C9EF")
                })
                .attr("height", (d) => y1(0) - y1(d.value));
        },
        [data.length]
    );

    return (
        <svg
            ref={ref}
            style={{
                height:"100%",
                width: "100%",
                marginRight: "0px",
                marginLeft: "0px",
            }}
        >
            <g className="plot-area" />
            <g className="x-axis" />
            {/* <g className="y-axis" /> */}
        </svg>
    );
}


export default BarChart;