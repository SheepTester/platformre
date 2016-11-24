var parts=[ /* 6 TALL LEVELS; space=air, @=ground, #=lava, +=win, ^=jumpboost, v=nojumping, ==mud, *=ice, w=water, < and > exist, 0-9 text */
  [ // 4-wide levels
    [
      " @@@",
      " @@@",
      "    ",
      "    ",
      "@== ",
      "@@@#"
    ],[
      "@@@@",
      "    ",
      "    ",
      "@  @",
      "@  @",
      "@vv@"
    ],[
      "    ",
      "  @@",
      "  @#",
      "  @#",
      "  @#",
      "^^@#"
    ],[
      "@@@@",
      "@   ",
      "@  @",
      "@  @",
      "   @",
      "@@@@"
    ],[
      "    ",
      "    ",
      "   @",
      "  @@",
      " @@@",
      "@@@@"
    ],[
      "    ",
      "    ",
      "    ",
      "  # ",
      "  # ",
      "@@@@"
    ],[
      "****",
      "    ",
      "    ",
      "    ",
      "    ",
      "#v#@"
    ],[
      "@  @",
      "    ",
      "    ",
      "    ",
      "@  @",
      "@^^@"
    ],[
      ".ss.",
      "sggs",
      "sggs",
      " ss ",
      "    ",
      "@@@@"
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
    ],[
      "L   #",
      "@ @ #",
      "@ @ #",
      "@ @ @",
      "  @  ",
      "@&@@@"
    ],[
      "     ",
      "    @",
      "   B@",
      "  B@@",
      " B@@@",
      "B@@@@"
    ],[
      "     ",
      "     ",
      "     ",
      "     ",
      "@# #@",
      "@@C@@"
    ],[
      "     ",
      "     ",
      "     ",
      "     ",
      "     ",
      "***##"
    ],[
      "@@#@@",
      "  #  ",
      "     ",
      "     ",
      "     ",
      "@@&@@"
    ],[
      "     ",
      "     ",
      "    #",
      "   ##",
      "  ###",
      "a####"
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
    ],[
      "@    @",
      "@@@@@@",
      "      ",
      "      ",
      "      ",
      ">>##<<"
    ],[
      "######",
      "      ",
      "      ",
      "      ",
      "      ",
      "@&&&&@"
    ],[
      "@@@@@@",
      "@@#@@@",
      "@# @#@",
      "@#   @",
      "      ",
      "======"
    ],[
      "wwww@w",
      "w@@w@w",
      "w@ww@w",
      "w@w@@w",
      "w@wwww",
      "@@@@@@"
    ],[
      "######",
      "w     ",
      "wwww  ",
      "w   ww",
      "w     ",
      "######"
    ],[
      "      ",
      "      ",
      "   w* ",
      "  *w**",
      " **w**",
      "******"
    ],[
      "######",
      "### ##",
      "# # ##",
      "  # # ",
      "      ",
      "@@aa##"
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
      "**   **",
      "*  C **",
      "   * * ",
      "   *   ",
      ">*****<"
    ],[
      "@@@@@@@",
      "wwwwwww",
      "w@#####",
      "w@@@@@@",
      "w@@@@@@",
      "@@@@@@@"
    ],[
      "w     @",
      "w>>>> @",
      "w@    R",
      "w@ <<<@",
      "wL     ",
      "@@>>>>>"
    ],[
      "@@@@@@@",
      "@#     ",
      "@#    R",
      "@@@@@ @",
      "      @",
      "@@@@@&@"
    ],[
      "       ",
      "       ",
      "       ",
      " vvvvv ",
      " @w w@ ",
      "*@wCw@*"
    ],[
      "#######",
      "       ",
      "       ",
      "       ",
      "      R",
      "@>>>>&@"
    ],[
      "@@@g@@@",
      "  @@@  ",
      "       ",
      "       ",
      "       ",
      "@#@@@#@"
    ],[
      "       ",
      "       ",
      "wwwwwww",
      "       ",
      "       ",
      "s#####s"
    ],
  ],[ // 8-wide levels
    [
      "        ",
      "        ",
      "        ",
      "        ",
      "        ",
      "@#<vv>#@"
    ],[
      "        ",
      "        ",
      "   RL   ",
      "   @@   ",
      "        ",
      "@@BBBB@@"
    ],[
      "        ",
      "        ",
      "        ",
      "        ",
      "        ",
      "@######@"
    ],[
      "@@@@@@@@",
      "@   @   ",
      "@ v @ v ",
      "  @   @ ",
      "  @   @ ",
      ">^@>>^@>"
    ],[
      "        ",
      "    @   ",
      "   @ @  ",
      "  @   @ ",
      " @     @",
      "@@     @"
    ],[
      " @     @",
      " @#####@",
      "        ",
      " @@@@@@@",
      " @     @",
      "@@vvvvv@"
    ],[
      "@@@@@@@@",
      "L  www  ",
      "  L w R ",
      "  L w R ",
      "  @#w#@ ",
      "@&@#w#@@"
    ],[
      "        ",
      "        ",
      "        ",
      "        ",
      "  swwws ",
      "ssssssss"
    ],[
      "        ",
      "        ",
      "        ",
      "  ``###`",
      "``@@@##@",
      "@@@@@@@@"
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
var exampleLevels=[
  [["Created by Steven!"],
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@       @",
    "@@@@@@@@@@@@@@@@@@@        eeeeeeee@@@      +@",
    "@@@@@@@@@@@@@@@@@@@        effffffe@@@      @@",
    "@@@@@@@@@@@@@@@@@@@        @@@@@@@e@@@      @@",
    "@#########@@@L             @@@@@L  R@@      @@",
    "@###eeee##@@@@>eee<vw      @@@@@L  R@@      @@",
    "@##e    ee@@@@#eeeR@w     p@@@@@L  R@@      @@",
    "@#e       @@@@Leee#@w      @@@@@L  R@@      @@",
    "@e  f^@ww#@@@@#eeeR@w      @@@@@L  R@@      @@",
    "@   #@@&ww@@@@L   R@w      @@@@@L  R@@      @@",
    "@   #@@ww#@@@@L    Raw# # #@@@@@L  R@@      @@",
    "@    @@&ww@@@@L&  R@ww# # #@@@@@L  R@@      @@",
    "@^   @@www@@@@L    Rww# # #@@@@@L  R@@      @@",
    "@#   @@w&w@@@@L   R@ww# # #@@@@@L  R@@      @@",
    "@    @@##w@@@@L  &@@ww# # #@@@@@L  R@@      @@",
    "@   ^@@www@@@@L   R@ww# # #@@@@@L  R@@      @@",
    "@   #@@www@@@@L    Rww# # #@@@@@L  R@@      @@",
    "@    @@w&w@@@@L&  R@ww# # #@@@@@L  R@@      @@",
    "@    @@w##@@@@L    Rww# # #@@@@@L  R@@      @@",
    "@^   @wwww@@@@L   R@ww# # #@@@@@L  R@@      @@",
    "@#   @ww##@@@@L  &@@ww# # #@@@@@L  R@@      @@",
    "@    #    @####   R@ww# # #@       R@@      @@",
    "@    #   #L       #@ww# # #@aaaa<  R## Ciiii@@",
    "@    #            #@a@#p#p#@@@@@@      #@@@@@@",
    "@0^^^@Cv*<><>*v^BB@@@@@@@@@@@@@@@@@>####@@@@@@"
  ], // BY STEVEN
  [["Created by Zach!"],
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@**              @        @ ####@",
    "@**              @      @;@+####@",
    "@**  @@@@@@@@@@;;       @@ +    @",
    "@**           @@@@ii@@@ @@ +aaa @",
    "@**           @@@   @@@ @@  ### @",
    "@**p@@>>>@m   @@@  t@@@ @@  ### @",
    "@**@@@@@@@@   @@@  @@@@p@@      @",
    "@  ########   @@@  @        ### @",
    "@  ########   *ww  @        ### @",
    "@             *ww  @        ### @",
    "@0@aa######@pp@@@ii@oo@@@@@@@@@p@"
  ], // BY ZACH
  [["Created by Zach!"],
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@   *******    ss  #### wwww@    @g    @",
    "@   wwwwwww        #### @@@w@ @;;@g    @",
    "@   w#####w           # @+@w@ @***g    @",
    "@   wwwwwww    vv     # @+@w@ @***g    @",
    "@   ww####w    ##       @ @w@ @***g    @",
    "@   wwwwwww    ##       @ @ww @***g    @",
    "@   w#####w    ##       @ @@@i@***g    @",
    "@   wwwwwww    ##       @ ********g    @",
    "@ >>*******^^^^##ggg&ggp@         g    @",
    "@0@@@@@@@@@@@@@@@@@@@@@@@p@@@@@@@@@@@@@@"
  ], // BY ZACH
    [["Created by Sean!"],
  "áááááááááááá",
  "+ááááááá...R",
  "+..ááááá.<yá",
  "+..ááááá.áyá",
  "+..ááááá.áyá",
  "+á       áyá",
  "ááááááááááyá",
  "á         yá",
  "á         yá",
  "á         yá",
  "á0áííáááííááá"
],
[[
"Made by Anonymous!"],
"@@@@@@@@@@@@@@@@@@@@@@@@@",
"@e           wwwwwwwww++@",
"@e           wwwwwwwww++@",
"@e @á@ó@áóó  wwwwwwwwwww@",
"@e         vvwwwwwwwwwww@",
"@á         *************@",
"@ á                     @",
"@  áóóó                 @",
"@   ááóó               @@",
"@     íí**<<<á         e@",
"@wwwwwwwwwwww íáí@wwCC@e@",
"@########úúúú    @ww@@@e@",
"@@@ááá@@@**úú   # @@   e@",
"@          úú         áá@",
"@          ú    óó     #@",
"@     áááaúúííóó    á###@",
"@         ííóó##áááá####@",
"@       ffff############@",
"@0@&&&@@@@@@@@@@@@@@@@@@@"
],
];
/* MADE BY SEAN */
