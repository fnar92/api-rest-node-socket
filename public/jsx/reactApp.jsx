/**
 * @name    reactApp.jsx - NodeJS Restful API for PostgreSQL
 * @author  Original work by Cesar Anton Dorantes @reicek, for Platzi.com/blog
 * @license 
 * Copyright (c) 2015-2016 Cesar Anton Dorantes
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE 
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 **/
"use strict"
var socket;
var startSocket            = function() {
   socket   = io(window.location.hostname);
}
var instance;
var dataArray;
var downloadData           = function(){
   $.ajax({
      url: '/api/list',
      dataType: 'json',
      success: function(res) {
         console.log('_________________');
         console.log('Simple List data recieved:');
         dataArray = res.data;
         console.log(dataArray);
         instance.setState({simpleList: dataArray});
      }.bind(instance),
      error: function(xhr, status, err) {
         console.log('_________________');
         console.log('Data error:');
         console.error(instance.props.url, status, err.toString())
      }.bind(instance)
   });
};
var SimpleFilterableList   = React.createClass({
   componentDidMount: function() {
      instance = this;
      startSocket();
      downloadData();
      socket.on('change', function (data) {
         console.log('_________________');
         console.log("Change, updating VDOM");
         downloadData();
      });
   },
   getInitialState: function() {
      return {
         userInput: "",
         simpleList: [
            {
               row: 'loading...'
            }
         ]
      };
   },
   updateUserInput: function(input){
      console.log('_________________');
      console.log('User search input:');
      console.log(input.target.value);
      instance.setState({userInput: input.target.value});
   },
   favToInput: function(){
      console.log('_________________');
      console.log('Convertig fav to input');
      document.getElementById("newElement").className    = '';
      document.getElementById("newElement").placeholder  = 'Add new step...';
   },
   sendNewElement: function(key){
      if (key.key == "Enter"){
         console.log('_________________');
         console.log('Sending new element:');
         console.log(document.getElementById('newElement').value);
         document.getElementById('newElement').disabled  = true;
         var newObject = {row:document.getElementById('newElement').value};
         dataArray.push(newObject);
         console.log(dataArray);
         $.ajax({
            url   : "/api/update",
            type  : "post",
            data  : {"data":dataArray}
         })
         .done(function(response){
            document.getElementById('newElement').value        = '';
            document.getElementById("newElement").className    = 'fav';
            document.getElementById("newElement").placeholder  = "+";
            document.getElementById('newElement').disabled     = false;
            document.getElementById("userInput").focus();
         });
      };
   },
   render: function(){
      return (
         <div>
            <input
               id          = 'userInput'
               type        = 'text'	
               placeholder = 'Filter list...'	
               onChange    = {this.updateUserInput}>
            </input>
            <SimpleList	
               simpleList  = {this.state.simpleList}
               userInput   = {this.state.userInput}/>
            <input
               id          = 'newElement'
               type        = 'text'
               placeholder = '+'
               onKeyPress  = {this.sendNewElement}
               onClick     = {this.favToInput}
               className   = 'fav'>
            </input>
         </div>
      );
   }
});
var SimpleList             = React.createClass({
   render: function() {
      return (
         <span>
            <p><strong>Steps to master a new programming language:</strong></p>
            <SimpleListRow 
               simpleList  = {this.props.simpleList} 
               userInput   = {this.props.userInput}/>
         </span>
      );
   }
});
var SimpleListRow       = React.createClass({
   render: function() {
      console.log('_________________');
      console.log('simpleList rows props:');
      console.log(this.props);
      var rows       = this.props.simpleList;
      var userInput  = this.props.userInput;
      return ( 
         <ol>
            {rows.map(function(element){
               if (element.row){
                  if (element.row.toLowerCase().search(userInput.toLowerCase()) > -1){
                     console.log("userInput found in simpleList row: "+element.row);
                     return (
                        <li>{element.row}</li>
                     );
                  }
               }
            })}
         </ol>
      );
   }
});
React.render(
   <SimpleFilterableList />,
   document.getElementById('list')
)
