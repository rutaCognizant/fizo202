<template>

  <table>
    <tr>
      <th colspan="4">Push-ups Scoring (${
        gender === "M" ? "Male" : "Female"
        })</th>
    </tr>
    <tr>
      <th>Age Group</th>
      <th>60 Points</th>
      <th>80 Points</th>
      <th>100 Points</th>
    </tr>
    <tr class="age-group">
      <td>18-25</td>
      <td class="highlight-60">${
        gender === "M" ? "35" : "25"
        }</td>
      <td>${
        gender === "M" ? "42" : "32"
        }</td>
      <td class="highlight-100">${gender === "M" ? "50" : "40"}</td>
    </tr>
    <tr class="age-group">
      <td>26-30</td>
      <td class="highlight-60">${
        gender === "M" ? "32" : "22"
        }</td>
      <td>${
        gender === "M" ? "39" : "29"
        }</td>
      <td class="highlight-100">${gender === "M" ? "47" : "37"}</td>
    </tr>
    <tr class="age-group">
      <td>31-35</td>
      <td class="highlight-60">${
        gender === "M" ? "30" : "20"
        }</td>
      <td>${
        gender === "M" ? "37" : "27"
        }</td>
      <td class="highlight-100">${gender === "M" ? "45" : "35"}</td>
    </tr>
  </table>

  <table>
    <tr>
      <th colspan="4">Crunches (Abs) Scoring (${
        gender === "M" ? "Male" : "Female"
        })</th>
    </tr>
    <tr>
      <th>Age Group</th>
      <th>60 Points</th>
      <th>80 Points</th>
      <th>100 Points</th>
    </tr>
    <tr class="age-group">
      <td>18-25</td>
      <td class="highlight-60">42</td>
      <td>52</td>
      <td class="highlight-100">62</td>
    </tr>
    <tr class="age-group">
      <td>26-30</td>
      <td class="highlight-60">40</td>
      <td>50</td>
      <td class="highlight-100">60</td>
    </tr>
    <tr class="age-group">
      <td>31-35</td>
      <td class="highlight-60">38</td>
      <td>48</td>
      <td class="highlight-100">58</td>
    </tr>
  </table>

  <table>
    <tr>
      <th colspan="4">3000m Run Scoring (${
        gender === "M" ? "Male" : "Female"
        })</th>
    </tr>
    <tr>
      <th>Age Group</th>
      <th>60 Points</th>
      <th>80 Points</th>
      <th>100 Points</th>
    </tr>
    <tr class="age-group">
      <td>18-25</td>
      <td class="highlight-60">${
        gender === "M" ? "16:30" : "19:00"
        }</td>
      <td>${
        gender === "M" ? "15:00" : "17:30"
        }</td>
      <td class="highlight-100">${
        gender === "M" ? "13:30" : "16:00"
        }</td>
    </tr>
    <tr class="age-group">
      <td>26-30</td>
      <td class="highlight-60">${
        gender === "M" ? "17:00" : "19:30"
        }</td>
      <td>${
        gender === "M" ? "15:30" : "18:00"
        }</td>
      <td class="highlight-100">${
        gender === "M" ? "14:00" : "16:30"
        }</td>
    </tr>
    <tr class="age-group">
      <td>31-35</td>
      <td class="highlight-60">${
        gender === "M" ? "17:30" : "20:00"
        }</td>
      <td>${
        gender === "M" ? "16:00" : "18:30"
        }</td>
      <td class="highlight-100">${
        gender === "M" ? "14:30" : "17:00"
        }</td>
    </tr>
  </table>

</template>