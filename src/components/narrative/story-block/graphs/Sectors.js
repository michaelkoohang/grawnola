import React, {useEffect, useRef} from 'react';
import {pointer, select} from 'd3-selection';
import {hierarchy, treemap} from 'd3-hierarchy';
import {scaleOrdinal} from 'd3-scale';
import {filter, map} from 'lodash';

const margin = {top: 30, right: 10, bottom: 10, left: 10};
const width = 900;
const height = 900;

function Sectors(props) {
  const d3Container = useRef(null);
  const {data} = props;

  useEffect(() => {
    if (data && d3Container.current) {
      const color = scaleOrdinal()
        .domain(map(data.children, sector => sector.name))
        .range([
          '#FF2D55', // Transportation
          '#64D2FF', // Electricity
          '#FF9F0A', // Industry
          '#32D74B', // Agriculture
          '#BF5AF2' // Residential
        ]);

      select(d3Container.current)
        .select('svg')
        .remove();

      const svg = select(d3Container.current)
        .append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .classed('svg-content', true)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

      const root = hierarchy(data)
        .sum(d => d.value);

      treemap()
        .size([width - (margin.right + margin.left), height - (margin.top + margin.bottom)])
        .paddingTop(30)
        .paddingRight(margin.right)
        .paddingInner(3)
        .round(true)
        (root);

      const nodes = svg.selectAll('rect')
        .data(root.leaves());

      nodes.enter()
        .append('rect')
        .attr('id', d => d.data.name)
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .style('stroke', 'white')
        .style('fill', d => {
          if (d.data.colname !== 'level3') return 'none';
          return color(d.parent.data.name);
        })
        .style('opacity', 1)
        .on('mouseover', mouseover);

      nodes.exit().remove()

      const nodeText = svg
        .selectAll('text')
        .data(root.leaves());

      nodeText.enter()
        .append('text')
        .attr('x', d => d.x0 + 5)
        .attr('y', d => d.y0 + 20)
        .text(d => d.data.subsector
          ? d.data.name
          : '')
        .attr('font-size', '18px')
        .attr('fill', 'white')

      const nodeVals = svg.selectAll('vals')
        .data(root.leaves())

      nodeVals.enter()
        .append('text')
        .attr('x', d => d.x0 + 5)
        .attr('y', d => d.y0 + 40)
        .text(d => d.data.subsector
          ? `${d.data.percent}%`
          : '')
        .attr('font-size', '16px')
        .attr('fill', 'white')

      svg.selectAll('titles')
        .data(filter(root.descendants(), sector => sector.depth === 1))
        .enter()
        .append('text')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0 + 24)
        .text(d => `${d.data.name} (${d.data.percent}%)`)
        .attr('font-size', d => d.data.name === 'Agriculture'
          ? '21px'
          : '24px')
        .attr('fill', d => color(d.data.name));

      svg.append('text')
        .style("opacity", 1)
        .style("fill", "white")
        .style('font-size', '24px')
        .style('font-weight', '100')
        .style('font-family', 'Helvetica')
        .text('Total US Greenhouse Gas Emissions by Sector 2018')
        .attr('transform',`translate(${width/6},${-10})`)

      var tooltip = svg.append('text')
        .style("opacity", 0)
        .style("fill", "white")
        .style('font-size', '32px')
        .style('font-weight', '600')
        .style('font-family', 'Helvetica')
        .style('z-index', 999)
        .attr('x',0)
        .attr('y', 0)

      var tooltipunits = svg.append('text')
        .text('million mt')
        .style("opacity", 0)
        .style("fill", "white")
        .style('font-size', '32px')
        .style('font-weight', '600')
        .style('font-family', 'Helvetica')
        .style('z-index', 999)
        .attr('x',0)
        .attr('y', 0)

      function mouseout(event, d) {
        tooltip.style('opacity', 0);
        tooltipunits.style('opacity', 0);
      }

      function mousemove(event, d) {
        let xy = pointer(event);
        tooltip
          .attr('x', xy[0] + 15)
          .attr('y', xy[1])
        tooltipunits
          .attr('x', xy[0] + 15)
          .attr('y', xy[1] + 35)
      }

      function mouseover(event, d) {
        tooltip.style('opacity', 1)
          .text(`~ ${(Math.round(d.data.carbon * 1000)).toLocaleString()}`);
        tooltipunits.style('opacity', 1)
      }
    }

  }, [data]);

  return (
    <div className="svg-container" ref={d3Container} />
  );
}

export default Sectors;
