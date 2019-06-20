/*
Search Color = #666666
Save As Existing Color = #274e13
Save As New Color = #660000
New Row Color = #b7b7b7
Last Action Box Color = #4c1130
*/
function onEdit() {
  var s = SpreadsheetApp.getActiveSpreadsheet();
  var main = s.getSheetByName("Main Screen");
  var db = s.getSheetByName("Database");
  var settings = s.getSheetByName("Settings");
  var col = s.getActiveSheet().getActiveRange().getColumn();
  var row = s.getActiveSheet().getActiveRange().getRow();
  var funcSearch = main.getRange(12,2);
  var funcSaveAsExisting = main.getRange(12,4);
  var funcSaveAsNew = main.getRange(12,6);
  var lastActionBox = main.getRange(12,9);
  switch(SpreadsheetApp.getActiveSheet().getSheetName())
  {
    case "Main Screen":
      if(main.getActiveRange().getValue() == "Debug")
      {
        return;
      }
      //Verify that onEdit can run
      if(settings.getRange(1,2).getValue() == "No")
      {
        if(row == 12)
        {
          if(col == 2 || col == 4 || col == 6)
          {
            Browser.msgBox("onEdit() scripts are currently disabled. If you want to enable then, toggle the 'Allow onEdit()' setting to 'Yes'");
            lastActionBox.setValue("Unable to perform action: onEdit() scripts are disabled");
            resetMainScreenButtons();
            return;
          }
        }
      }
      
      //FuncSearch
      if(col == 2 && row == 12)
      {
        Logger.log("We're Searching now...");
        funcSearch.setValue("Seraching").setBackground("red");
        var searchID = main.getRange(2,1).getValue();
        var ptName = main.getRange(2,3).getValue();
        if(searchID == "")
        {
          if(ptName == "")
          {  
            Browser.msgBox("Missing ID and Patient Name");
            lastActionBox.setValue("Please enter a Case ID or Patient Name. Case ID would be the best case");
            resetMainScreenButtons();
            return;
          }
          else
          {
            if(searchByPTName(ptName));
          }
        }
        else
        {
          searchByID(searchID);
        }
      }
      
      //FuncSaveAsNew
      if(col == 6 && row == 12)
      {
        Logger.log("Save As New triggered");
        funcSaveAsNew.setValue("Working").setBackground("red");
        if(main.getRange(2,1).getValue() == "")
        {
          Browser.msgBox("Missing ID");
          lastActionBox.setValue("Please enter a Case ID");
          resetMainScreenButtons();
          return;
        }
        if(main.getRange(2,3).getValue() == "")
        {
          Browser.msgBox("Missing Patient Name")
          lastActionBox.setValue("Please enter a Patient Name");
          resetMainScreenButtons();
          return
        }
        if(verifyIDCopy() == false)
        {
          Logger.log("No copy of ID exists, nothing to see here");
        }
        else
        {
          Logger.log("This ID already exists, failing");
          Browser.msgBox("This ID already exists, please generate a new unique ID");
          resetMainScreenButtons();
          lastActionBox.setValue("Unable to save case as a new case, because the ID is already in use");
          return;
        }
        var temp = db.getLastRow();
        temp = temp + 2;
        var rowsToCopyFromMain = checkMainScreenRows();
        var destination = db.getRange(temp, 1, rowsToCopyFromMain, 16);
        var data = main.getRange(2,1,rowsToCopyFromMain,16).copyTo(destination,{contentsOnly:true});
        funcSaveAsNew.setValue("Save As New Case").setBackground("#660000");
        insertBlankRow();
        lastActionBox.setValue("The case has been saved as a new case in the Database");
        main.getRange(2, 1, 7, 14).setValue("");
      }
      break;
    case "Database":
      break;
    case "Settings":
      break;
    default:
      Browser.msgBox("Looks like Danielle hasn't configured this sheet to do stuff or be ignored yet... Tell Danielle to do her job already");
      break;
  }
}

//func to tell how many rows are being saved
function checkMainScreenRows()
{
  var s = SpreadsheetApp.getActiveSpreadsheet();
  var main = s.getSheetByName("Main Screen");
  for(n=2;n<9;n++)
  {
    if(s.getSheetByName("Main Screen").getRange(n,6).getValue() != "")
    {
      continue;
    }
    else
    {
      n = n-1;
      var numberOfRows = n-1;
      Logger.log("Stopped on row #"+n+", so there are "+numberOfRows+" rows in the sheet");
      return numberOfRows;
    }
  }
}
//func to verify id number doesn't already exist
function verifyIDCopy()
{
  var s = SpreadsheetApp.getActiveSpreadsheet();
  var main = s.getSheetByName("Main Screen");
  var db = s.getSheetByName("Database");
  var testID = main.getRange(2,1).getValue();
  var startAtLastDBRow = db.getLastRow();
  var exists = false;
  Logger.log("We are checking to see if "+testID+" exists already")
  for (n=startAtLastDBRow;n>1;n--)
  {
    var existingID = db.getRange(n,1).getValue();
    if(existingID == testID)
    {
      var exists = true;
      Logger.log(testID+" already exists, failing");
      return exists;
    }
  }
  Logger.log(testID+" does not already exist, passing");
  return exists;
}
//func to get next in line ID number

//func to insert one grey blank row in DB
function insertBlankRow()
{
  var s = SpreadsheetApp.getActiveSpreadsheet();
  var db = s.getSheetByName("Database");
  var lr = db.getLastRow();
  db.getRange(lr+1,1,1,16).setBackground("#b7b7b7");
}
//func to reset all Main Screen buttons to normal
function resetMainScreenButtons()
{
  var s = SpreadsheetApp.getActiveSpreadsheet();
  var main = s.getSheetByName("Main Screen");
  main.getRange(12,2).setValue("Search").setBackground("#666666");
  main.getRange(12,4).setValue("Save as Existing Case").setBackground("#274e13");
  main.getRange(12,6).setValue("Save as New Case").setBackground("#660000");
}
//func to copy selected result from DB to Main
function copyResultToMain(a,b)//a = startRow | b = numOfRows
{
  var s = SpreadsheetApp.getActiveSpreadsheet();
  var main = s.getSheetByName("Main Screen");
  var db = s.getSheetByName("Database");
  
  db.getRange(a, 1, b, 16).copyValuesToRange(main, 1, 16, 2, b+1);
  main.getRange(2,17).setValue(a); //These are pasted In the 
  main.getRange(3,17).setValue(b);//DONOTTOUCH section of the Main Screen
}
//func to search by ID
function searchByID(a)//a = search ID
{
  var s = SpreadsheetApp.getActiveSpreadsheet();
  var main = s.getSheetByName("Main Screen");
  var db = s.getSheetByName("Database");
  var lastActionBox = main.getRange(12,9);
  
  var lrdb = db.getLastRow();
  var idData = db.getRange(2, 1,lrdb-1,1).getValues().toString();
  for(n=1;n<idData.length;n++)
  {
    if(searchID == idData[n])
    {
      //Find out how many rows exist for case
      var startRow = n;
      for(i=1;i<8;i++)
      {
        var tester = db.getRange(n+i, 1).getValue();
        if(tester == ""){continue;}
        else
        {
          var numOfRows = i-1; 
        }
      }
      copyResultToMain(startRow,numOfRows);
    }
  }
}
//func to search by PT Name
function searchByPTName(a)//a = PT Name
{
  var s = SpreadsheetApp.getActiveSpreadsheet();
  var main = s.getSheetByName("Main Screen");
  var db = s.getSheetByName("Database");
  var lastActionBox = main.getRange(12,9);
  
  var results = []
  var numRows = db.getLastRow();
  var names = db.getRange(2, 4, numRows).getValues();
  for(n=1;n<names.length;n++)
  {
    if(a == names[n].toString())
    {
      var startRow = n;
      for(i=1;i<8;i++)
      {
        var tester = db.getRange(n+i, 1).getValue();
        if(tester == ""){continue;}
        else
        {
          var numOfRows = i-1;
          results.push(db.getRange(n, 1, numOfRows, 16).getValues());
          continue;
        }
      }
      
    }
    else{continue;}
    if(results.length > 1)
    {
      //starts a loop to pull some info from the arrays, which will be promtped on a Browser.prompt
      //so that we'll have the ability to quiz the user as to which result they want to paste
      
    }
    if(results.length == 1)
    {
      //Skip the prompt, since it's just one result, we will paste it to main screen with no confrimation needed.
    }
    if(results.length == 0)
    {
      Browser.msgBox("There were no results for "+". Verify that you typed the name correctly. We always try to make the names <FirstName> <LastName> with no commas");
      resetMainScreenButtons();
      lastActionBox.setValue("Tried to search for"+a+" and no results were found");
      return false;
    }
  }
}
/*
Search Color = #666666
Save As Existing Color = #274e13
Save As New Color = #660000
New Row Color = #b7b7b7
Last Action Box Color = #4c1130
*/