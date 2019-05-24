/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const IssuesModel = require('../models/Issues.js');

// const CONNECTION_STRING = process.env.DB;
// MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, db) => {
//   console.log('Connected to database');
// });

mongoose.connect(process.env.DB, {useNewUrlParser: true}/*, {useFindAndModify: false}*/);
mongoose.set('useFindAndModify', false);
// let db = mongoose.connection;

module.exports = function (app) {

  app.route('/api/issues/:project')
    // GET seems to work
    .get(function (req, res){
      let project = req.params.project;
      // Build query object
      let query = {
        issue_title: req.query.issue_title,
        issue_text: req.query.issue_text,
        created_by: req.query.created_by,
        open: req.query.open,
        assigned_to: req.query.assigned_to,
        status_text: req.query.status_text,
        created_on: req.query.created_on,
        updated_on: req.query.updated_on
      }
      // Add project to query so the query for .find() works
      query.project = project;
      
      // Remove any undefeined query elements
      for(let item in query) {
        if(!query[item]) {
          delete query[item];
        }
      }
      
      // Do search
      IssuesModel.find(query, (error, issue) => {
        let issuesForProject = [];
        if(error) {
          res.send('Error occurred');
          return;
        }
        res.send(issue);
      });
    })
  
    // POST seems to work
    .post(function (req, res){
      let project = req.params.project;
      let issue = new IssuesModel({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        open: true,
        project: project,
        created_on: new Date(),
        updated_on: new Date(),
      });
      issue.save()
        .then(newIssue => {
        res.json({_id: newIssue._id, issue_title: issue.issue_title, issue_text: issue.issue_text, created_on: issue.created_on, updated_on: issue.updated_on, created_by: issue.created_by, assigned_to: issue.assigned_to, open: true, status_text: issue.status_text});
      })
        .catch(err => {
        res.send('Missing required fields');
      })
    })
  
    // PUT seems to work
    .put(function (req, res){
      let project = req.params.project;
      let id = req.body._id;
      let updates = req.body;
      let title;
      // Do not need the _id in the object created as it is its own variable
      delete updates._id;
      // console.log("id: " + updates._id);
      // Remove any items from updates that were not passed in
      for (let item in updates) {
         if (!updates[item]) {
           delete updates[item];
         }
       }
    
      if(Object.keys(updates).length === 0) {
        res.send('No updated field sent');
      } else {
        updates.updated_on = new Date();
        // Find the issue in the database and delete it
        IssuesModel.findOne({_id: id}, (error, issue) => {
          if (error) {
              res.send('Please enter the valid id of the issue to delete.');
              return;
          }
          title = issue.issue_title;
          if(title == null || title == undefined){
           res.send('Please enter the valid id of the issue to delete.');
            return;
          }
          IssuesModel.findOneAndUpdate({_id: id}, updates, {useFindAndModify: false}, (error, issue) => {
            if(error) {
              res.send('Could not update ' + id);
              return;
            } else {
              res.send('Successfully updated');
            }
          });
        });
      }
    })
      
    // DELETE seems to work
    .delete(function (req, res){
      let project = req.params.project;
      // Get the id of the project to delete
      let _id = req.body._id;
    
      if(!_id) {
        res.send('_id error');
        return;
      }
      
      // Find the issue in the database and delete it        
      IssuesModel.findOneAndRemove({_id: _id}, (error, issue) => {
        if(error) {
          res.send('Could not delete ' + _id);
          return;
        }
        // Tell user
        res.send('Deleted ' + _id);
      });
    });
};
