;(function() {
  var nativeApp = {
    migrationsColor: d3.scale.log()
                      .range(["#2F9D96", "#052021"])
                      .interpolate(d3.interpolateHcl),

    init: function() {
      this.drawTimeLine();
    },

    //タイムラインの作成
    drawTimeLine: function() {

var moneyMillionsFormat = function(v) { return moneyFormat(1e6 * v); };

var tseriesLine = d3.svg.line()
  .interpolate("monotone")
  .defined(function(d) {
    return !isNaN(d.value)});

      var migrationYears = [ 1960, 1970, 1980, 1990, 2000, 2010 ];
      var remittanceYears = [
        1970,1971,1972,1973,1974,1975,1976,1977,1978,1979,1980,
        1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,
        1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,
        2003,2004,2005,2006,2007,2008,
        2009,2010,2011,2012
      ];  // year 2012 is an estimation


      var remittanceTotals, remittanceTotalsByMigrantsOrigin,
          remittanceTotalsPerMigrant, remittanceTotalsPerMigrantByMigrantsOrigin,
          maxRemittanceValue, maxRemittancePerMigrantValue,
          migrationTotals, migrationTotalsByOrigin,
          aidTotals, aidTotalsByRecipient;

      var remittanceYearsDomain = [1970, 2012];

      var timelineMargins = {left:40,top:10,bottom:5,right:80};
      var timelineWidth = 550,
          timelineHeight = 180;

      var timelineSvg = d3.select("#timeline").append("svg")
          .attr("width", timelineWidth + timelineMargins.left + timelineMargins.right)
          .attr("height", (timelineHeight + timelineMargins.top + timelineMargins.bottom));

      var timeline = timelineSvg.append("g")
          .attr("class", "chart")
          .attr("transform","translate("+timelineMargins.left+","+timelineMargins.top+")");

    initTimeSeries("aid");
    initTimeSeries("remittances");

    var timelineAxisGroup = timeline.append("g")
      .attr("class", "timeAxis")
      .attr("transform", "translate(0,"+timelineHeight+")");

    var timelineRightAxisGroup = timeline.append("g")
      .attr("class", "magnitudeAxis")
      .attr("transform", "translate("+(timelineWidth)+",0)");

    var yearScale = d3.scale.linear()
      .domain(remittanceYearsDomain);

    var tseriesScale = d3.scale.linear()
      .range([timelineHeight, 2]);

    var yearAxis = d3.svg.axis()
      .scale(yearScale)
      .orient("top")
      .ticks(timelineWidth / 70)
      .tickSize(10, 5, timelineHeight)
      .tickSubdivide(4)
      .tickPadding(5)
      .tickFormat(function(d) { return d; });

    var magnitudeAxis = d3.svg.axis()
      .scale(tseriesScale)
      .orient("right")
      .ticks(timelineHeight / 40)
      .tickSize(5, 0, 0)
      .tickPadding(2)
      .tickFormat(moneyMillionsFormat);

    var selectedCountry = null, highlightedCountry = null;
    var perMigrant = false;


    timelineAxisGroup.call(yearAxis);

    updateTimeSeries();
    updateColorLegend();

function initTimeSeries(name) {
  var tseries = timeline.select("g.tseries");

  if (tseries.empty()) {
    tseries = timeline.append("g")
      .attr("class", "tseries");
  }

  var path = tseries.select("path." + name);
  if (path.empty) {
    tseriesLine
      .x(function(d) { return yearScale(d.year); })
      .y(function(d) { return tseriesScale(d.value); });

    tseries.append("path")
      .attr("class", name)
      .attr("fill", "none");
  }

  if (tseries.select("g.legend").empty()) {
    var legend = tseries.append("g")
      .attr("class", "legend")
      .attr("transform",
        "translate(120,10)"
      );

    var gg = legend.append("g")
       .attr("class", "remittances")
       .attr("transform", "translate(0, 10)");

    gg.append("circle")
      .attr("cx", 5)
      .attr("r", 5);
    gg.append("text")
      .attr("x", 15)
      .text(msg("details.tseries.legend.remittances"));

    gg = legend.append("g")
       .attr("class", "aid")
       .attr("transform", "translate(0, 30)");

    gg.append("circle")
      .attr("cx", 5)
      .attr("r", 5);
    gg.append("text")
      .attr("x", 15)
      .text(msg("details.tseries.legend.aid"));

  }
}

function renderTimeSeries(name, data) {
  var tseries = timeline.select("g.tseries");
  var path = tseries.select("path." + name);

  if (data == null) data = {};
  var years = remittanceYears; // d3.keys(data).sort();



  tseries.datum(years.map(function(y) { return { year:y,  value: data[y] }; }), years)
    .select("path." + name)
      .attr("d", function(d) {
        var line = tseriesLine(d);
        if (line == null) line = "M0,0";
        return line;
      });

}

function updateColorLegend() {
  var container = d3.select("#color-legend");
  var margin = {left:40, top:30, right:20, bottom:20};
  var w = 150 - margin.left - margin.right,
      h = 60 - margin.top - margin.bottom;

  var rect, gradient;
  var svg, defs, g = container.select("g.color-legend");

  if (g.empty()) {
    svg = container.append("svg")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom);
    gradient = svg.append("defs")
      .append("linearGradient")
        .attr({ id : "migrants-scale-gradient", x1 :"0%", y1 :"0%", x2 : "100%", y2:"0%" });
    gradient.append("stop")
      .attr({ offset:"0%", "stop-color": nativeApp.migrationsColor.range()[0] });
    gradient.append("stop")
      .attr({ offset:"100%", "stop-color": nativeApp.migrationsColor.range()[1] });

    g = svg.append("g")
        .attr("class", "color-legend")
        .attr("transform", "translate("+margin.left+","+margin.top+")");

    rect = g.append("rect")
      .attr({
        "class": "gradient",
        stroke : "#aaa",
        "stroke-width" : "0.3",
        width: w, height: h,
        fill: "url(#migrants-scale-gradient)"
      })


    g.append("text")
      .attr({ "class":"title", x : w/2, y : -7, "text-anchor":"middle" })
      .text(msg("legend.migrants.number"));

    g.append("text")
      .attr({ "class":"axis", x : 0, y : h + 13, "text-anchor":"middle" })
      .text(msg("legend.migrants.low"));

    g.append("text")
      .attr({ "class":"axis", x : w, y : h + 13, "text-anchor":"middle" })
      .text(msg("legend.migrants.high"));
  }

  rect = g.select("rect.gradient");
}


function updateTimeSeries() {

  var remittances, aid;

  var country = (selectedCountry || highlightedCountry);

  if (perMigrant) {
    aid = [];
    if (country == null) {
      remittances = remittanceTotalsPerMigrant;
    } else {
      remittances = remittanceTotalsPerMigrantByMigrantsOrigin[country];
    }
    d3.select("#timeline g.tseries .legend .remittances text")
      .text(msg("details.tseries.legend.remittances.per-capita"));
  } else {
    if (country == null) {
      remittances = remittanceTotals;
      aid = aidTotals;
    } else {
      remittances = remittanceTotalsByMigrantsOrigin[country];
      aid = aidTotalsByRecipient[country];
    }
    d3.select("#timeline g.tseries .legend .remittances text")
      .text(msg("details.tseries.legend.remittances"));
  }

  var rmax = d3.max(d3.values(remittances));
  var dmax = d3.max(d3.values(aid));

  var max;
  if (isNaN(rmax)) max = dmax;
  else if (isNaN(dmax)) max = rmax;
  else max = Math.max(rmax, dmax);

  max *= 1.15;

  tseriesScale.domain([0, max]);
  if (perMigrant) {
    d3.selectAll("#timeline g.tseries .aid")
      .attr("visibility", "hidden");
  } else {
    d3.selectAll("#timeline g.tseries .aid")
      .attr("visibility", "visible");
    renderTimeSeries("aid", aid);
  }
  renderTimeSeries("remittances", remittances);

  timeline.select("g.magnitudeAxis").call(magnitudeAxis);
}

    }

  }
  nativeApp.init();
})();
