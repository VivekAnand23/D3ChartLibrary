import {
  Component,
  OnInit
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {
  margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  };
  width: number = 500 - this.margin.left - this.margin.right; // Use the window's width
  height: number = 500 - this.margin.top - this.margin.bottom; // Use the window's height
  // The number of datapoints
  n = 21;
  dataset = null;
  svg = null;
  public div = d3.select('#chart').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  constructor() {}

  ngOnInit() {
    this.dataset = this.getDataSet();
    this.svg = this.getChartArea();
    this.render(this);
  }


  // 5. X scale will use the index of our data
  getXScale() {
    return d3.scaleLinear()
      .domain([0, this.n - 1]) // input
      .range([0, this.width]); // output
  }

  // 6. Y scale will use the randomly generate number
  getYScale() {
    return d3.scaleLinear()
      .domain([0, 25]) // input
      .range([this.height, 0]); // output
  }

  // 7. d3's line generator
  line(obj) {
    const _this = obj;
    return d3.line()
      .x(function (d, i) {
        return _this.getXScale()(i);
      }) // set the x values for the line generator
      .y(function (d) {
        return _this.getYScale()(d.y);
      }) // set the y values for the line generator
      .curve(d3.curveMonotoneX); // apply smoothing to the line
  }

  createDots(obj) {
    const _this = obj;
    // 12. Appends a circle for each datapoint
    this.svg.selectAll('.circle')
    .data(_this.dataset)
    .enter().append('circle') // Uses the enter().append() method
    .attr('class', 'dot') // Assign a class for styling
    .attr('cx', function (d, i) {
      return _this.getXScale()(i);
    })
    .attr('cy', function (d) {
      return _this.getYScale()(d.y);
    })
    .attr('r', 10)
    .on('mouseover', function (d) {
      _this.div.transition()
        .duration(200)
        .style('opacity', .9);
      _this.div.html(d.y + '<br/>' + d.y)
        .style('left', (d3.event.pageX) + 'px')
        .style('top', (d3.event.pageY - 28) + 'px');
    })
    .on('mouseout', function (d) {
      _this.div.transition()
        .duration(500)
        .style('opacity', 0);
    });
  }
  // 8. An array of objects of length N. Each object has key -> value pair, the key being 'y' and the value is a random number
  getDataSet() {
    return d3.range(this.n).map(function (d) {
      return {
        'y': d3.randomUniform(25)()
      };
    });
  }
  getChartArea() {
    return d3.select('#chart').append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  render(obj) {
    const _this = obj;
    // 3. Call the x axis in a group tag
    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(this.getXScale())); // Create an axis component with d3.axisBottom

    // 4. Call the y axis in a group tag
    this.svg.append('g')
      .attr('class', 'y axis')
      .call(d3.axisLeft(this.getYScale())); // Create an axis component with d3.axisLeft

    // 9. Append the path, bind the data, and call the line generator
    this.svg.append('path')
      .datum(this.dataset) // 10. Binds data to the line
      .attr('class', 'line') // Assign a class for styling
      .attr('d', this.line(this)); // 11. Calls the line generator

    this.createDots(this);
  }

  updateChart(obj) {
    const _this = obj;
    _this.n = Math.floor(d3.randomUniform(20)());
    _this.dataset = this.getDataSet();

    // Scale the range of the data again
    const xScale = _this.getXScale().domain(d3.extent(this.dataset, function (d) {
      return d.y;
    }));
    const yScale = _this.getYScale().domain([0, d3.max(this.dataset, function (d) {
      return d.y;
    })]);

    // Select the section we want to apply our changes to
    const svg = d3.select('#chart').transition();

    svg.selectAll('.dot').remove();
    svg.select('.line') // change the line
      .duration(750)
      .attr('d', this.line(this)(this.dataset));
    svg.select('.x.axis') // change the x axis
      .duration(750)
      .call(d3.axisBottom(xScale));
    svg.select('.y.axis')
      .duration(750)
      .call(d3.axisLeft(yScale));

    _this.createDots(_this);
  }
}
