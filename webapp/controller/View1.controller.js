sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/format/DateFormat"
], function(Controller, JSONModel, Fragment, DateFormat) {
    "use strict";

    return Controller.extend("project1.controller.View1", {

        onInit: function() {
            var oModel = new JSONModel({
                currentWeekStartDate: this._getMonday(new Date()), // Get the current week's Monday
                dateRange: "", // Initialize date range
                allocations: this._getInitialAllocations()
            });
            this.getView().setModel(oModel);

            this._updateWeekDates();
            this._updateDateRange();
        },

        _getInitialAllocations: function() {
            return [
                { day: "Mon", date: "", project: "", description: "", hours: "", total: "" },
                { day: "Tue", date: "", project: "", description: "", hours: "", total: "" },
                { day: "Wed", date: "", project: "", description: "", hours: "", total: "" },
                { day: "Thu", date: "", project: "", description: "", hours: "", total: "" },
                { day: "Fri", date: "", project: "", description: "", hours: "", total: "" }
            ];
        },

        _getMonday: function(d) {
            d = new Date(d);
            var day = d.getDay(),
                diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
            return new Date(d.setDate(diff));
        },

        _calculateWeekDates: function(startDate) {
            var dates = [];
            for (var i = 0; i < 5; i++) { // Assuming 5 working days (Mon-Fri)
                var date = new Date(startDate);
                date.setDate(date.getDate() + i);
                dates.push(date);
            }
            return dates;
        },

        _updateWeekDates: function() {
            var oModel = this.getView().getModel();
            var oCurrentWeekStartDate = oModel.getProperty("/currentWeekStartDate");
            var aWeekDates = this._calculateWeekDates(oCurrentWeekStartDate);

            var oDateFormat = DateFormat.getDateInstance({ pattern: "dd" });
            oModel.setProperty("/weekDates", aWeekDates.map(function(date) {
                return oDateFormat.format(date);
            }));

            // Update the date for each allocation entry
            var aAllocations = oModel.getProperty("/allocations");
            for (var i = 0; i < aAllocations.length; i++) {
                aAllocations[i].date = oDateFormat.format(aWeekDates[i]);
            }
            oModel.setProperty("/allocations", aAllocations);
        },

        _updateDateRange: function() {
            var oModel = this.getView().getModel();
            var oCurrentWeekStartDate = oModel.getProperty("/currentWeekStartDate");

            var oEndDate = new Date(oCurrentWeekStartDate);
            oEndDate.setDate(oCurrentWeekStartDate.getDate() + 4); // End date is Friday

            var oDateFormat = DateFormat.getDateInstance({ pattern: "dd-MM-yyyy" });
            var sStartDate = oDateFormat.format(oCurrentWeekStartDate);
            var sEndDate = oDateFormat.format(oEndDate);

            oModel.setProperty("/dateRange", `${sStartDate} - ${sEndDate}`);
        },

        _changeWeek: function(iWeekOffset) {
            var oModel = this.getView().getModel();
            var oCurrentWeekStartDate = oModel.getProperty("/currentWeekStartDate");
            var oNewWeekStartDate = new Date(oCurrentWeekStartDate);
            oNewWeekStartDate.setDate(oCurrentWeekStartDate.getDate() + iWeekOffset * 7);
            oModel.setProperty("/currentWeekStartDate", oNewWeekStartDate);
            this._updateWeekDates();
            this._updateDateRange();
        },

        onPreviousWeek: function() {
            this._changeWeek(-1);
        },

        onNextWeek: function() {
            this._changeWeek(1);
        },

        onCurrentWeek: function() {
            var oModel = this.getView().getModel();
            var oCurrentMonday = this._getMonday(new Date());
            oModel.setProperty("/currentWeekStartDate", oCurrentMonday);
            this._updateWeekDates();
            this._updateDateRange();
        },
        onDeletePress: function(oEvent) {
            // Get the table control
            var oTable = this.byId("allocationTable");
            
            // Get the selected item (row) where the delete button was clicked
            var oSelectedItem = oEvent.getSource().getParent().getParent();
            
            // Get the binding context of the selected item
            var oBindingContext = oSelectedItem.getBindingContext();
            if (!oBindingContext) {
                return; // Exit if no binding context found
            }
            
            // Get the path to the selected item in the model
            var sPath = oBindingContext.getPath();
            
            // Get the model
            var oModel = this.getView().getModel();
            
            // Get the allocations array from the model
            var aAllocations = oModel.getProperty("/allocations");
            
            // Get the index of the item in the allocations array
            var iIndex = parseInt(sPath.split("/").pop());
            
            // Remove the item from the allocations array
            if (iIndex > -1) {
                aAllocations.splice(iIndex, 1);
            }
            
            // Update the model with the new allocations array
            oModel.setProperty("/allocations", aAllocations);
            
            // Remove the item from the table
            oTable.removeItem(oSelectedItem);
        },
                                      
        onFavouritePress: function(oEvent) {
            var oSelectedItem = oEvent.getSource().getParent().getParent(); // Adjust based on table structure
            var oBindingContext = oSelectedItem.getBindingContext();
            var sPath = oBindingContext.getPath();
            var oModel = this.getView().getModel();
            var bIsFavourite = oModel.getProperty(sPath + "/isFavourite"); // Example property to toggle

            oModel.setProperty(sPath + "/isFavourite", !bIsFavourite);
        },

        // Footer buttons
        onReleaseEntries: function() {
            // Example: Implement release entries logic
            // Typically involves backend integration or confirmation dialog
        },

        onSave: function() {
            // Example: Implement save logic
            // Typically involves validation and then saving data to backend
        },

        onManageFavourites: function() {
            var oView = this.getView();
            Fragment.load({
                id: oView.getId(),
                name: "project1.Fragments.ManageFavourites",
                controller: this
            }).then(function(oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
            });
        },
        onAddPress: function(oEvent) {
            var oTable = this.byId("allocationTable");
            var oSource = oEvent.getSource();
            var oRow = oSource.getParent().getParent();
            var iIndex = oTable.indexOfItem(oRow);
        
            var oNewItem = new sap.m.ColumnListItem({
                cells: [
                    new sap.m.VBox({
                        items: [new sap.m.Text({ text: "" })]
                    }).addStyleClass("customCellSpacing"), // Apply customCellSpacing class to this cell
        
                    new sap.m.VBox({
                        items: [new sap.m.Input({ placeholder: "Enter project name" })]
                    }).addStyleClass("customCellSpacing"), // Apply customCellSpacing class to this cell
        
                    new sap.m.VBox({
                        items: [new sap.m.TextArea({ placeholder: "Enter description (up to 100 words)",
                        cols: 50
                     })]
                    }).addStyleClass("sapUiSmallMargin customCellSpacing"), // Apply sapUiSmallMargin and customCellSpacing classes
        
                    new sap.m.HBox({
                        items: [
                            new sap.m.Input({
                                width: "3rem"
                            })
                        ],
                        justifyContent: "Center" // Horizontally centers items within the HBox
                    }).addStyleClass("customCellSpacing"), // Apply customCellSpacing class to this cell
        
                    new sap.m.VBox({
                        items: [new sap.m.Text({ text: "" })]
                    }).addStyleClass("customCellSpacing"), // Apply customCellSpacing class to this cell
        
                    new sap.m.HBox({
                        items: [new sap.m.Button({ icon: "sap-icon://delete", press: this.onDeletePress.bind(this) })],
                        justifyContent:"Center"
                    }).addStyleClass("customCellSpacing") // Apply customCellSpacing class to this cell
                ]
            }).addStyleClass("customRowSpacing"); // Apply customRowSpacing class to the entire row
        
            oTable.insertItem(oNewItem, iIndex + 1);
        },        
                      
        onDescriptionLiveChange: function(oEvent) {
            var sDescription = oEvent.getParameter("value");
            var iWordCount = this._countWords(sDescription);
            var oWordCountText = this.byId("wordCount");

            if (iWordCount <= 100) {
                oWordCountText.setText(iWordCount + "/100 words");
                oWordCountText.removeStyleClass("exceeded");
            } else {
                oWordCountText.setText("100/100 words (limit exceeded)");
                oWordCountText.addStyleClass("exceeded");
            }
        },

        _countWords: function(sText) {
            if (!sText) {
                return 0;
            }
            return sText.trim().split(/\s+/).length;
        }

    });
});
