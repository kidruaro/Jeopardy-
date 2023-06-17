// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
let catTitle = [];
let catData = {};


const tbody = document.createElement("tbody");
const table = document.querySelector("#jeopardy");
jservURL = "http://jservice.io/";
const button = document.querySelector("#start");
const NUM_QUESTIONS_PER_CAT = 5;
$("#spin-container").hide();

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  const response = await axios({
    baseURL: jservURL,
    url: `/api/categories?count=100`,
    method: "GET",
  });

  const allCategories = response.data;
  const randomCategories = [];

  while (randomCategories.length < 6) {
    const randomIndex = Math.floor(Math.random() * allCategories.length);
    const randomCategory = allCategories[randomIndex];
    if (!randomCategories.includes(randomCategory.id)) {
      randomCategories.push(randomCategory.id);
    }
    console.log(randomCategory.id);
  }
  return randomCategories;
}


/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  //const rand = Math.floor(Math.random() * catId.length);

  console.log(catId);

  const response = await axios({
    baseURL: jservURL,
    url: `/api/category?id=${catId}`,
    method: "GET",
  });

  const category = response.data;
  const clues = category.clues.map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));

  const categoryData = {
    title: category.title,
    clues: clues,
  };

  return categoryData;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 * console.log(catData.title);
  

 */

async function fillTable() {
  tbody.innerHTML = "";
  const table = document.querySelector("#jeopardy");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  table.style.display = "table";
  table.innerHTML = "";

  for (let catId in catData) {
    const headerCell = document.createElement("td");
    headerCell.textContent = catData[catId].title;
    headerRow.appendChild(headerCell);
  }

  thead.appendChild(headerRow);
  table.appendChild(thead);

  let questionNumber = 100;

  for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
    const catRow = document.createElement("tr");

    for (let catId in catData) {
      const questionCell = document.createElement("td");
      const clues = catData[catId].clues;

      questionCell.textContent = questionNumber;
      questionCell.addEventListener("click", function () {
        questionCell.textContent = clues[i].question;
        questionCell.removeEventListener("click", arguments.callee);
      });

      catRow.appendChild(questionCell);
    }

    tbody.appendChild(catRow);
    questionNumber += 100;
  }

  table.appendChild(tbody);
}


/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  const cell = evt.target;
  const row = cell.parentNode;
  const colIndex = [...row.children].indexOf(cell);

  const categoryIndex = [...row.parentNode.children].indexOf(row);
  const categoryId = Object.keys(catData)[colIndex];
  const clues = catData[categoryId].clues;

  const clue = clues[categoryIndex];

  if (!clue.showing) {
    cell.textContent = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    cell.textContent = clue.answer;
    clue.showing = "answer";
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  const table = document.querySelector("#jeopardy");
  table.innerHTML = "";
  $("#spin-container").show();
  $("#show-container").show();
  const button = document.querySelector("#start");
  button.disabled = true;
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#spin-container").hide();
  $("#show-container").remove();
  const button = document.querySelector("#start");

  button.textContent = "Restart Game";
  button.disabled = false;
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 *
 * */

async function setupAndStart() {
  const ids = await getCategoryIds();
  
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const data = await getCategory(id);
    catData[i] = data;
  }

  fillTable();
}
/** On click of start / restart button, set up game. */

// TODO
button.addEventListener("click", () => {
  showLoadingView();
  setupAndStart()
  hideLoadingView();
});
/** On page load, add event handler for clicking clues */
tbody.addEventListener("click", handleClick);
// TODO

/*



*/
