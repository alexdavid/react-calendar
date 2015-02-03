"use strict";

var _ = require('lodash');
var React = require('react');
var moment = require('moment');

var dateToComponentMap = {
  Month: 'YYYY-MM',
  Week: 'gggg-ww',
  Day: 'YYYY-DDDD'
};

var CalendarBaseMixin = {
  moment: function (...args) {
    var localMoment = moment.apply(this, args);
    localMoment.locale(this.getPropOrCtx('locale'));
    return localMoment;
  },

  splitChildrenByDate: function (comp, children) {
    if (!children) {
      children = [];
    }
    React.Children.forEach(this.props.children, (child) => {
      children.push(child);
    });

    var result = {
      thisGlobals: [],
      nextGlobals: []
    };
    var dateString = dateToComponentMap[comp.displayName];
    children.forEach((child) => {
      if (child.props.date) {
        var childDate = child.props.date.format(dateString);
        var existing = result[childDate] || {
          thisLevel: [],
          nextLevels: []
        };
        if (child instanceof comp) {
          if (child.props.date === 'all') {

          } else {
            existing.thisLevel.push(child);
          }
        } else {
          existing.nextLevels.push(child);
        };
        result[childDate] = existing;
      } else if (child instanceof comp){
        result.thisGlobals.push(child);
      } else {
        result.nextGlobals.push(child);
      }
    });

    return result;
  },

  makeDirectChild: function (childrenMap, comp, date) {
    var key = date.format(dateToComponentMap[comp.displayName]);
    var props = {
      key: key,
      date: date
    };

    var thisChildren = childrenMap[key] || {};
    var thisLevel = childrenMap.thisGlobals.concat(
      thisChildren.thisLevel || []
    );
    var children = childrenMap.nextGlobals.concat(
      thisChildren.nextLevels || []
    );

    thisLevel.forEach((child) => {
      React.Children.forEach(child.props.children, (childChild) => {
        children.push(childChild);
      });
      props = _.assign({}, child.props, props);
    });

    return comp(props, children);
  }
};

module.exports = CalendarBaseMixin;
