var parts=[ /* 6 TALL LEVELS; space=air, @=ground, #=lava, +=win, ^=jumpboost, v=nojumping, ==mud, *=ice, w=water, < and > exist, 0-9 text */
  [ // 4-wide levels
    [
      " @@@",
      " @@@",
      " @@@",
      "    ",
      "@   ",
      "@==#"
    ],
  ],[ // 5-wide levels
    [
      "@www@",
      "@www@",
      "@w#w@",
      "ww#ww",
      "ww#ww",
      "@@@@@"
    ],[
      "@www@",
      "@www@",
      "@www@",
      " www ",
      " www ",
      "@###@"
    ],[
      "@@@@@",
      "@@@@@",
      "@@@@@",
      "@@@@@",
      "     ",
      "@<<<@"
    ],
  ],[ // 6-wide levels
    [
      "######",
      "      ",
      "      ",
      "      ",
      "      ",
      "@@^@^@"
    ],
  ],[ // 7-wide levels
    [
      "       ",
      "       ",
      "       ",
      "       ",
      "       ",
      ">***>**"
    ],[
      "*******",
      "**    *",
      "*  C  *",
      "   *   ",
      "   *   ",
      ">*****<"
    ]
  ],[ // 8-wide levels
    [
      "        ",
      "        ",
      "        ",
      "        ",
      "        ",
      "@@#<vv>#"
    ],
  ],
],start=[
  "@   ",
  "@   ",
  "@   ",
  "@   ",
  "@   ",
  "@C0@",
],fin=[
  "   +",
  "   +",
  "   +",
  "   +",
  "   +",
  "2@@@",
],upwards1=[
  "   @",
  "   @",
  "   @",
  "   @",
  "   @",
  "1^@@",
],upwards2=[
  "@   ",
  "@   ",
  "@   ",
  "@   ",
  "@   ",
  "@@ @",
];
document.body.innerHTML+="<button onclick='createRandomLevel()'>GENERATE LEVEL</button>";