import { Component, OnInit } from '@angular/core';
import { HistogramDistribution } from './histogramDistribution'
import * as d3 from "d3";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'piediagram';


ngOnInit(): void {
  
    this.drawPieDiagramSvg([
      { dateRange : "2019-12-12" , total: 1000, delivered: 400, undeliverable:300, expired : 200, enroute:100 }
     ]);

}

drawPieDiagramSvg(data: HistogramDistribution[]){

  d3.selectAll('div#pieDiagramHolder svg').remove();

  if( data && data.length === 0){
    return;
  }

  let initialWidth:number = 500;

  let initialHeight:number = 500;

  const z = d3.scaleOrdinal().range([ "msgdelivered" ,  "msgundeliverable","msgenroute","msgexpired" ]);
  const keys = [ "delivered", "undeliverable", "enroute", "expired" ];

  z.domain(keys);

  let delivered = 0;
  let undeliverable = 0;
  let expired = 0;
  let enroute = 0;
  let total = 0;

  data.forEach( (e) => {
      delivered +=  e.delivered;
      undeliverable +=  e.undeliverable;
      expired +=   e.expired;
      enroute  +=   e.enroute;
      total  +=  e.total;
    }
  ); 
    
  // let margin = { top: 20, right: 20, bottom: 20, left: 20},
  const margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = initialWidth - margin.right - margin.left,
  height = initialHeight - margin.top - margin.bottom,
  radius = (height/2);

  let cumulativeData = [
      {  "label" : "delivered" ,  "count": delivered },
      {  "label" : "undeliverable" ,  "count": undeliverable },
      {  "label" : "expired" ,  "count": expired },
      {  "label" : "enroute" ,  "count": enroute }
  ];

// arc for the labels position
let labelArc = d3.arc()
    .outerRadius(radius * .8 )
    .innerRadius(radius * .6 );

// pie chart arc. Need to create arcs before generating pie
let arc = d3.arc()
    .outerRadius(radius * .6 )
    .innerRadius(radius * .5 );

// generate pie chart and donut chart
let pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.count; });

let svg = d3.select("div#pieDiagramHolder").append("svg")
.attr("width", width)
.attr("height", height)
.append("g")
.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


// Define the div for the tooltip
let div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

// "g element is a container used to group other SVG elements"
let g = svg.selectAll(".arc")
.data(pie(cumulativeData))
.enter().append("g")
.attr("class", function(d) {
  return z(d.data.label);
 })
 .on('mouseover', function(d) {		
  div.transition()		
      .duration(100)		
      .style("opacity", .9);		
      div.html( "<span>"+ (d.data.label.charAt(0).toUpperCase() + d.data.label.slice(1)	) + " : "  + d.data.count +"</span><br>"+
      "<span>"+ "Total" + " : "  + total +"</span>" )	
      .style("left", (d3.event.pageX - 40) + "px")		
      .style("top", (d3.event.pageY - 40) + "px");	
  })
  .on('mousemove', function(d) {		
    div.transition()		
        .duration(100)		
        .style("opacity", .9);	 
        div.html( "<span>"+ (d.data.label.charAt(0).toUpperCase() + d.data.label.slice(1)	) + " : "  + d.data.count +"</span><br>"+
         "<span>"+ "Total" + " : "  + total +"</span>" )	
         .style("left", (d3.event.pageX - 40) + "px")		
         .style("top", (d3.event.pageY - 40) + "px");	
    }) 
 .on('mouseout', function(d) {		
  div.transition()		
      .duration(500)		
      .style("opacity", 0);	
});


let tweenPie = (b) => {
  b.innerRadius = 0;
  var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
  return function(t) { return arc(i(t)); };
}


// append path 
g.append("path")
  .attr("d", arc)
  // transition 
  .transition()
  .ease(d3.easeLinear)
  .duration(2000)
  .attrTween("d", tweenPie);

// append text
g.append("text")
  .transition()
    .ease(d3.easeLinear)
    .duration(2000)
.attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
.attr("dy",".35em")
    .attr("text-anchor", "middle")
    .attr("class", "pieChartOuterLabel")
    .text(function(d) {
      const percentage = Math.floor( (d.data.count * 100)/total ) ;
        if( percentage < 1){
            return '';
          } else {
            return Math.round( (d.data.count * 100)/total ) + " %"; }
        }
    );

  let labelSize =  Math.ceil ( (1.5/radius));
  let valueSize =  labelSize + labelSize * .25;

  g.append("text")
    .transition().delay(2000)
      .attr("text-anchor", "middle")
      .attr("font-size", (labelSize)+'em')
      .attr("dy", '-1.5em')
      .text("Total");
    

  g.append("text")
    .transition().delay(2000)
      .attr("text-anchor", "middle")
      .attr("font-size", (valueSize)+'em')
      .text(total);
}



}
