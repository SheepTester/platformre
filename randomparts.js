var parts=[ /* 6 TALL LEVELS; space=air, @=ground, #=lava, +=win, ^=jumpboost, v=nojumping, ==mud, *=ice, w=water, < and > exist, 0-9 text */
  [ // 4-wide levels
    [
      " @@@",
      " @@@",
      " @@ ",
      "    ",
      "@   ",
      "@==#"
    ],[
      "@@@@",
      "    ",
      "    ",
      "@  @",
      "@  @",
      "@vv@"
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
    ],[
      "LLLLLL",
      "RRRRRR",
      "LLLLLL",
      "      ",
      "      ",
      "RRRRRR"
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
    ],[
      "        ",
      "        ",
      "   RL   ",
      "   @@   ",
      "        ",
      "@@BBBB@@"
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
  " ^ @",
  " @B@",
  "1@@@",
],upwards2=[
  "@***",
  "@*w*",
  "@***",
  "@@@@",
  "@L  ",
  "@@ C",
];
//document.body.innerHTML+="<button onclick='createRandomLevel()'>GENERATE LEVEL</button>";
setTimeout(function(){
  createRandomLevel();
},100);