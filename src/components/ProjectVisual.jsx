import { useId } from 'react';

const themeMap = {
  terrace: {
    skyStart: '#F5ECDE',
    skyEnd: '#DCCDB8',
    hillSoft: '#AEB9A1',
    hillDeep: '#879576',
    ground: '#E4D7C5',
    deck: '#EDE2D2',
    building: '#CBB99E',
    buildingShade: '#B29C84',
    foliage: '#7F9275',
    foliageDeep: '#6E8463',
    water: '#C8D3C3',
    sun: '#EBDDCA',
    blocks: [
      { x: 835, y: 570, width: 170, height: 300, terraces: 6 },
      { x: 990, y: 530, width: 200, height: 350, terraces: 7 },
      { x: 1180, y: 515, width: 180, height: 330, terraces: 6 },
      { x: 1320, y: 555, width: 135, height: 255, terraces: 5 },
    ],
    trees: [
      { x: 380, y: 610, scale: 1.35 },
      { x: 575, y: 670, scale: 1.1 },
      { x: 1090, y: 720, scale: 0.9 },
    ],
  },
  canopy: {
    skyStart: '#F4EDDF',
    skyEnd: '#D9CDBE',
    hillSoft: '#B5C0A8',
    hillDeep: '#879772',
    ground: '#E5DACB',
    deck: '#EFE5D5',
    building: '#D1C2A9',
    buildingShade: '#B9AA91',
    foliage: '#7B9271',
    foliageDeep: '#67805D',
    water: '#C7D1C1',
    sun: '#E8D8C1',
    blocks: [
      { x: 900, y: 610, width: 185, height: 220, terraces: 4 },
      { x: 1065, y: 595, width: 180, height: 250, terraces: 4 },
      { x: 1240, y: 625, width: 165, height: 200, terraces: 4 },
    ],
    trees: [
      { x: 460, y: 640, scale: 1.15 },
      { x: 710, y: 690, scale: 0.95 },
      { x: 1230, y: 700, scale: 0.8 },
    ],
  },
  campus: {
    skyStart: '#F6EEDF',
    skyEnd: '#DDD1C0',
    hillSoft: '#BAC4AD',
    hillDeep: '#8C9C7A',
    ground: '#E8DCCF',
    deck: '#F1E7D8',
    building: '#D4C4AA',
    buildingShade: '#B9A88D',
    foliage: '#839575',
    foliageDeep: '#708460',
    water: '#CBD7CA',
    sun: '#EADCC7',
    blocks: [
      { x: 820, y: 625, width: 140, height: 190, terraces: 3 },
      { x: 980, y: 585, width: 150, height: 235, terraces: 4 },
      { x: 1140, y: 610, width: 150, height: 210, terraces: 4 },
      { x: 1320, y: 640, width: 120, height: 170, terraces: 3 },
    ],
    trees: [
      { x: 430, y: 620, scale: 1.2 },
      { x: 640, y: 650, scale: 0.95 },
      { x: 960, y: 730, scale: 0.8 },
    ],
  },
  wetland: {
    skyStart: '#F4ECDF',
    skyEnd: '#D8CEC1',
    hillSoft: '#B7C4B1',
    hillDeep: '#889877',
    ground: '#E5DBCC',
    deck: '#EEE6D7',
    building: '#CDBEA8',
    buildingShade: '#B6A490',
    foliage: '#819475',
    foliageDeep: '#6B8060',
    water: '#BFCFC4',
    sun: '#E9DCC8',
    blocks: [
      { x: 990, y: 600, width: 155, height: 220, terraces: 3 },
      { x: 1155, y: 590, width: 180, height: 235, terraces: 3 },
      { x: 1315, y: 625, width: 135, height: 180, terraces: 3 },
    ],
    trees: [
      { x: 355, y: 620, scale: 1.2 },
      { x: 530, y: 680, scale: 0.9 },
      { x: 870, y: 710, scale: 0.75 },
    ],
  },
  corridor: {
    skyStart: '#F6EEDF',
    skyEnd: '#DDD2C1',
    hillSoft: '#B7C2A9',
    hillDeep: '#879670',
    ground: '#E7DCCF',
    deck: '#EFE6D9',
    building: '#CCBCA4',
    buildingShade: '#B5A28A',
    foliage: '#7F9371',
    foliageDeep: '#687E5B',
    water: '#C2CFC4',
    sun: '#E8DBC6',
    blocks: [
      { x: 960, y: 620, width: 150, height: 170, terraces: 3 },
      { x: 1130, y: 615, width: 135, height: 185, terraces: 3 },
      { x: 1280, y: 610, width: 145, height: 190, terraces: 3 },
    ],
    trees: [
      { x: 360, y: 650, scale: 1.1 },
      { x: 640, y: 710, scale: 0.8 },
      { x: 1110, y: 735, scale: 0.7 },
    ],
  },
  housing: {
    skyStart: '#F6EEDF',
    skyEnd: '#DDD2C2',
    hillSoft: '#B8C1AA',
    hillDeep: '#8A9876',
    ground: '#E7DBCC',
    deck: '#F1E7D9',
    building: '#D1C2AA',
    buildingShade: '#B4A18B',
    foliage: '#809372',
    foliageDeep: '#6B815F',
    water: '#C7D1C4',
    sun: '#EADCC8',
    blocks: [
      { x: 905, y: 580, width: 145, height: 250, terraces: 4 },
      { x: 1080, y: 555, width: 145, height: 275, terraces: 4 },
      { x: 1255, y: 580, width: 145, height: 245, terraces: 4 },
    ],
    trees: [
      { x: 420, y: 625, scale: 1.1 },
      { x: 715, y: 665, scale: 0.95 },
      { x: 1070, y: 720, scale: 0.8 },
    ],
  },
};

function renderBuilding(block, colors, index) {
  const terraceDepth = 22;
  const windowRows = Math.max(3, Math.floor(block.height / 52));
  const windowCols = Math.max(3, Math.floor(block.width / 34));

  return (
    <g key={`${block.x}-${block.y}-${index}`} transform={`translate(${block.x} ${block.y})`}>
      <rect
        fill={colors.buildingShade}
        height={block.height}
        rx="16"
        width={block.width}
        x="8"
        y={-block.height + 10}
      />
      <rect
        fill={colors.building}
        height={block.height}
        rx="16"
        width={block.width}
        x="0"
        y={-block.height}
      />
      {Array.from({ length: block.terraces }).map((_, terraceIndex) => {
        const terraceY = -block.height + 30 + terraceIndex * 38;
        return (
          <g key={`terrace-${terraceIndex}`} transform={`translate(${-16} ${terraceY})`}>
            <rect
              fill={colors.deck}
              height="16"
              rx="8"
              width={block.width + 32}
              x="0"
              y="0"
            />
            <rect
              fill={terraceIndex % 2 === 0 ? colors.foliage : colors.foliageDeep}
              height="20"
              opacity="0.88"
              rx="10"
              width={block.width - 6}
              x="18"
              y={-terraceDepth}
            />
          </g>
        );
      })}
      {Array.from({ length: windowRows }).map((_, rowIndex) =>
        Array.from({ length: windowCols }).map((__, colIndex) => {
          const gapX = 22;
          const gapY = 18;
          const cellWidth =
            (block.width - gapX * 2 - 10) / Math.max(1, windowCols);
          const x = gapX + colIndex * cellWidth;
          const y = -block.height + 25 + rowIndex * gapY;

          return (
            <rect
              fill="rgba(246, 241, 232, 0.68)"
              height="8"
              key={`window-${rowIndex}-${colIndex}`}
              rx="3"
              width={Math.max(12, cellWidth - 12)}
              x={x}
              y={y}
            />
          );
        }),
      )}
    </g>
  );
}

function renderTree(tree, colors, index) {
  return (
    <g key={`${tree.x}-${tree.y}-${index}`} transform={`translate(${tree.x} ${tree.y}) scale(${tree.scale})`}>
      <path d="M-6 0 L4 -92 L16 0 Z" fill="#8A775E" opacity="0.6" />
      <ellipse cx="0" cy="-82" fill={colors.foliageDeep} rx="32" ry="34" />
      <ellipse cx="28" cy="-75" fill={colors.foliage} rx="28" ry="28" />
      <ellipse cx="-24" cy="-64" fill={colors.foliage} rx="24" ry="24" />
      <ellipse cx="10" cy="-48" fill={colors.foliageDeep} rx="24" ry="22" />
    </g>
  );
}

function ScenicVariant({ colors, config, gradientId }) {
  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={colors.skyStart} />
          <stop offset="65%" stopColor={colors.skyEnd} />
          <stop offset="100%" stopColor={colors.ground} />
        </linearGradient>
      </defs>

      <rect fill={`url(#${gradientId})`} height="1000" width="1600" />
      <circle cx="1230" cy="165" fill={colors.sun} opacity="0.85" r="105" />
      <path
        d="M0 520 C 220 420, 420 450, 620 390 C 830 325, 1020 345, 1250 298 C 1400 270, 1510 275, 1600 300 L1600 1000 L0 1000 Z"
        fill={colors.hillSoft}
        opacity="0.92"
      />
      <path
        d="M0 640 C 160 540, 340 595, 520 525 C 720 445, 900 520, 1070 460 C 1240 398, 1450 425, 1600 410 L1600 1000 L0 1000 Z"
        fill={colors.hillDeep}
        opacity="0.95"
      />
      <path
        d="M0 760 C 200 670, 430 728, 640 648 C 825 579, 1130 662, 1310 608 C 1450 565, 1540 570, 1600 590 L1600 1000 L0 1000 Z"
        fill={colors.ground}
      />
      <path
        d="M0 790 C 170 770, 330 735, 470 705 C 640 666, 840 690, 970 650 C 1120 605, 1280 610, 1600 700 L1600 1000 L0 1000 Z"
        fill={colors.deck}
        opacity="0.95"
      />
      <path
        d="M0 815 C 175 790, 355 785, 515 740 C 675 695, 870 730, 1030 695 C 1205 655, 1400 650, 1600 742"
        fill="none"
        opacity="0.7"
        stroke={colors.buildingShade}
        strokeWidth="18"
      />
      {config.blocks.map((block, index) => renderBuilding(block, colors, index))}
      {config.trees.map((tree, index) => renderTree(tree, colors, index))}
      <g opacity="0.76">
        {Array.from({ length: 11 }).map((_, index) => (
          <g key={`plant-${index}`} transform={`translate(${100 + index * 132} ${782 - (index % 3) * 12})`}>
            <path
              d="M0 52 C 8 30, 16 15, 22 -14"
              fill="none"
              stroke={index % 2 === 0 ? colors.foliage : colors.foliageDeep}
              strokeLinecap="round"
              strokeWidth="2.5"
            />
            <path
              d="M18 8 C 33 10, 44 18, 50 31 C 33 34, 20 30, 13 16 Z"
              fill={colors.foliage}
              opacity="0.75"
            />
            <path
              d="M-2 18 C -15 20, -27 28, -32 39 C -18 41, -8 36, 0 26 Z"
              fill={colors.foliageDeep}
              opacity="0.7"
            />
          </g>
        ))}
      </g>
    </>
  );
}

function PlanVariant({ colors }) {
  return (
    <>
      <rect fill="#F4EEE5" height="1000" width="1600" />
      <rect
        fill="none"
        height="780"
        rx="42"
        stroke="rgba(127, 146, 117, 0.55)"
        strokeWidth="6"
        width="1180"
        x="210"
        y="110"
      />
      <path
        d="M330 320 C 530 150, 890 155, 1120 270 C 1265 344, 1288 470, 1185 566 C 1065 677, 815 719, 650 805"
        fill="none"
        stroke="rgba(127, 146, 117, 0.7)"
        strokeWidth="24"
      />
      <path
        d="M415 304 C 566 390, 720 405, 880 372 C 1008 346, 1098 278, 1170 210"
        fill="none"
        stroke="rgba(47, 47, 43, 0.14)"
        strokeDasharray="12 16"
        strokeWidth="7"
      />
      {[
        [405, 398, 250, 120],
        [655, 328, 238, 110],
        [937, 368, 224, 126],
        [770, 505, 255, 148],
        [490, 525, 206, 126],
      ].map(([x, y, width, height], index) => (
        <g key={`plan-block-${index}`}>
          <rect
            fill="rgba(231, 220, 203, 0.65)"
            height={height}
            rx="26"
            stroke="rgba(47, 47, 43, 0.18)"
            strokeWidth="4"
            width={width}
            x={x}
            y={y}
          />
          {Array.from({ length: 5 }).map((_, stripeIndex) => (
            <rect
              fill="rgba(127, 146, 117, 0.22)"
              height="12"
              key={`plan-stripe-${stripeIndex}`}
              rx="6"
              width={width - 36}
              x={x + 18}
              y={y + 18 + stripeIndex * 20}
            />
          ))}
        </g>
      ))}
      {Array.from({ length: 22 }).map((_, index) => (
        <circle
          cx={260 + index * 48}
          cy={760 - (index % 4) * 16}
          fill="rgba(127, 146, 117, 0.28)"
          key={`tree-dot-${index}`}
          r={10 + (index % 3) * 4}
        />
      ))}
    </>
  );
}

function SectionVariant({ colors, config }) {
  const sectionBlocks = config.blocks.slice(0, 3);

  return (
    <>
      <rect fill="#F4EEE5" height="1000" width="1600" />
      <path
        d="M0 640 C 240 620, 495 635, 690 600 C 920 562, 1110 610, 1600 552 L1600 1000 L0 1000 Z"
        fill={colors.ground}
      />
      <path
        d="M0 760 C 260 736, 530 730, 775 695 C 980 666, 1230 660, 1600 698 L1600 1000 L0 1000 Z"
        fill={colors.deck}
      />
      <line
        stroke="rgba(47, 47, 43, 0.22)"
        strokeWidth="5"
        x1="100"
        x2="1500"
        y1="520"
        y2="520"
      />
      {sectionBlocks.map((block, index) => {
        const width = block.width + 18;
        const height = Math.round(block.height * 0.78);
        const x = 360 + index * 275;
        const y = 730;

        return (
          <g key={`section-${index}`} transform={`translate(${x} ${y})`}>
            <rect
              fill={colors.buildingShade}
              height={height}
              rx="12"
              width={width}
              x="10"
              y={-height}
            />
            <rect
              fill={colors.building}
              height={height}
              rx="12"
              width={width}
              x="0"
              y={-height}
            />
            {Array.from({ length: 4 }).map((_, floorIndex) => (
              <g key={`section-floor-${floorIndex}`}>
                <line
                  stroke="rgba(47, 47, 43, 0.18)"
                  strokeWidth="4"
                  x1="0"
                  x2={width}
                  y1={-height + 42 + floorIndex * 56}
                  y2={-height + 42 + floorIndex * 56}
                />
                <rect
                  fill={floorIndex % 2 === 0 ? colors.foliage : colors.foliageDeep}
                  height="18"
                  opacity="0.78"
                  rx="9"
                  width={width + 28}
                  x="-14"
                  y={-height + 28 + floorIndex * 56}
                />
              </g>
            ))}
          </g>
        );
      })}
      {config.trees.slice(0, 2).map((tree, index) =>
        renderTree(
          {
            ...tree,
            x: 240 + index * 1040,
            y: 720,
            scale: index === 0 ? 1.3 : 1.1,
          },
          colors,
          index,
        ),
      )}
    </>
  );
}

function DetailVariant({ colors }) {
  return (
    <>
      <rect fill="#F2ECE2" height="1000" width="1600" />
      {Array.from({ length: 5 }).map((_, colIndex) => (
        <g key={`detail-column-${colIndex}`} transform={`translate(${220 + colIndex * 220} 140)`}>
          <rect
            fill={colIndex % 2 === 0 ? colors.building : colors.buildingShade}
            height="700"
            rx="16"
            width="172"
            x="0"
            y="0"
          />
          {Array.from({ length: 6 }).map((__, rowIndex) => (
            <g key={`detail-terrace-${rowIndex}`} transform={`translate(-18 ${48 + rowIndex * 108})`}>
              <rect
                fill={colors.deck}
                height="18"
                rx="9"
                width="206"
                x="0"
                y="0"
              />
              <rect
                fill={rowIndex % 2 === 0 ? colors.foliage : colors.foliageDeep}
                height="28"
                opacity="0.86"
                rx="14"
                width="142"
                x="30"
                y="-28"
              />
            </g>
          ))}
          {Array.from({ length: 7 }).map((__, windowIndex) => (
            <rect
              fill="rgba(246, 241, 232, 0.74)"
              height="58"
              key={`detail-window-${windowIndex}`}
              rx="9"
              width="38"
              x={24 + (windowIndex % 3) * 44}
              y={54 + Math.floor(windowIndex / 3) * 218}
            />
          ))}
        </g>
      ))}
      <g opacity="0.5">
        {Array.from({ length: 15 }).map((_, index) => (
          <g key={`vine-${index}`} transform={`translate(${150 + index * 90} ${820 - (index % 4) * 18})`}>
            <path
              d="M0 62 C 6 32, 14 12, 18 -32"
              fill="none"
              stroke={colors.foliageDeep}
              strokeLinecap="round"
              strokeWidth="2.5"
            />
            <path
              d="M15 -4 C 34 2, 44 11, 50 21 C 31 24, 21 20, 11 8 Z"
              fill={colors.foliage}
              opacity="0.7"
            />
            <path
              d="M0 18 C -16 22, -28 29, -34 39 C -20 42, -9 36, -1 26 Z"
              fill={colors.foliage}
              opacity="0.6"
            />
          </g>
        ))}
      </g>
    </>
  );
}

function StudyVariant({ colors, gradientId }) {
  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#F5EFE6" />
          <stop offset="100%" stopColor="#E6DCC9" />
        </linearGradient>
      </defs>
      <rect fill={`url(#${gradientId})`} height="1000" width="1600" />
      <path
        d="M335 204 C 508 82, 782 86, 932 176 C 1048 247, 1062 359, 963 438 C 869 512, 725 519, 676 608 C 633 688, 701 819, 862 866 C 1070 928, 1310 824, 1422 662 C 1510 534, 1510 332, 1355 209 C 1183 73, 849 42, 618 84 C 489 108, 395 145, 335 204 Z"
        fill="rgba(168, 183, 154, 0.22)"
      />
      <path
        d="M220 600 C 310 505, 515 490, 653 561 C 744 607, 768 703, 702 769 C 631 840, 496 861, 372 835 C 239 807, 146 699, 220 600 Z"
        fill="rgba(231, 220, 203, 0.92)"
      />
      <g opacity="0.5">
        {Array.from({ length: 9 }).map((_, index) => (
          <circle
            cx={1255 + (index % 3) * 54}
            cy={192 + Math.floor(index / 3) * 54}
            fill={colors.foliageDeep}
            key={`study-dot-${index}`}
            r="3"
          />
        ))}
      </g>
      <path
        d="M248 690 C 420 633, 572 527, 756 470 C 920 420, 1118 450, 1270 526"
        fill="none"
        stroke="rgba(127, 146, 117, 0.55)"
        strokeDasharray="14 18"
        strokeWidth="8"
      />
      <g transform="translate(720 280)">
        <rect
          fill="rgba(246, 241, 232, 0.88)"
          height="355"
          rx="26"
          stroke="rgba(47, 47, 43, 0.1)"
          strokeWidth="4"
          width="470"
          x="0"
          y="0"
        />
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <path
            d={`M34 ${54 + rowIndex * 58} L430 ${54 + rowIndex * 58}`}
            fill="none"
            key={`study-line-${rowIndex}`}
            stroke={rowIndex % 2 === 0 ? 'rgba(127, 146, 117, 0.45)' : 'rgba(47, 47, 43, 0.15)'}
            strokeWidth={rowIndex === 2 ? 8 : 4}
          />
        ))}
        <path
          d="M68 103 C 138 75, 211 65, 306 79 C 373 90, 406 127, 406 169 C 406 211, 367 253, 292 272 C 207 294, 117 312, 88 354"
          fill="none"
          stroke="rgba(127, 146, 117, 0.62)"
          strokeWidth="16"
        />
        {[
          [88, 125, 126, 78],
          [226, 184, 155, 95],
          [118, 288, 112, 50],
        ].map(([x, y, width, height], index) => (
          <rect
            fill="rgba(231, 220, 203, 0.66)"
            height={height}
            key={`study-block-${index}`}
            rx="18"
            stroke="rgba(47, 47, 43, 0.12)"
            strokeWidth="3"
            width={width}
            x={x}
            y={y}
          />
        ))}
      </g>
      <g transform="translate(1190 500)" opacity="0.7">
        <path
          d="M0 235 C 14 179, 34 132, 60 74 C 82 31, 96 9, 112 -24"
          fill="none"
          stroke={colors.foliageDeep}
          strokeLinecap="round"
          strokeWidth="4"
        />
        {[
          [38, 140, 78, 34, -24],
          [63, 92, 84, 35, -18],
          [91, 44, 74, 32, -6],
          [18, 172, 72, 28, -34],
        ].map(([x, y, width, height, rotate], index) => (
          <ellipse
            cx={x}
            cy={y}
            fill="none"
            key={`study-leaf-${index}`}
            rx={width / 2}
            ry={height / 2}
            stroke={colors.foliage}
            strokeWidth="4"
            transform={`rotate(${rotate} ${x} ${y})`}
          />
        ))}
      </g>
    </>
  );
}

function PortraitVariant({ colors, gradientId }) {
  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#F5EFE6" />
          <stop offset="100%" stopColor="#E3D9C8" />
        </linearGradient>
      </defs>
      <rect fill={`url(#${gradientId})`} height="1000" width="1600" />
      <path
        d="M355 210 C 530 84, 835 98, 1045 160 C 1248 220, 1378 382, 1350 573 C 1318 789, 1148 874, 914 872 C 692 869, 473 782, 384 620 C 311 489, 265 276, 355 210 Z"
        fill="rgba(168, 183, 154, 0.18)"
      />
      <path
        d="M826 241 C 922 242, 993 294, 1041 375 C 1082 445, 1110 564, 1082 661 C 1055 752, 972 831, 864 842 C 771 852, 669 820, 607 744 C 540 660, 519 520, 543 425 C 566 334, 630 266, 718 246 C 753 238, 790 240, 826 241 Z"
        fill="#222222"
        opacity="0.92"
      />
      <path
        d="M704 402 C 770 336, 883 324, 968 361 C 1027 387, 1070 456, 1076 533 C 1085 629, 1046 719, 969 771 C 902 817, 805 833, 727 792 C 642 747, 584 650, 587 548 C 590 490, 620 431, 669 393 C 678 385, 690 377, 704 402 Z"
        fill="#EFE6DA"
        opacity="0.98"
      />
      <path
        d="M804 298 C 907 289, 992 366, 1020 446 C 1048 524, 1040 627, 999 713 C 975 763, 952 787, 914 814 C 963 753, 982 691, 986 601 C 991 499, 952 394, 804 298 Z"
        fill="#171717"
        opacity="0.96"
      />
      <path
        d="M669 469 C 714 419, 795 385, 863 389 C 849 405, 836 415, 830 428 C 810 467, 808 551, 807 610 C 806 693, 817 759, 844 806 C 759 802, 671 749, 626 669 C 589 602, 588 536, 610 496 C 620 478, 642 465, 669 469 Z"
        fill="#0F0F0F"
        opacity="0.98"
      />
      <path
        d="M795 395 C 752 423, 730 474, 724 516 C 719 554, 722 603, 729 640 C 733 662, 744 707, 758 736 C 716 720, 685 686, 666 636 C 636 558, 646 478, 692 426 C 717 397, 754 382, 795 395 Z"
        fill="#2B2B2B"
        opacity="0.92"
      />
      <path
        d="M707 866 C 726 797, 762 747, 812 719 C 866 688, 931 686, 989 716 C 1033 739, 1070 790, 1091 866"
        fill="none"
        stroke="#171717"
        strokeLinecap="round"
        strokeWidth="54"
      />
      <circle cx="893" cy="545" fill="#0F0F0F" r="5" />
      <path
        d="M867 614 C 886 628, 914 629, 938 617"
        fill="none"
        stroke="#1A1A1A"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <g opacity="0.65" transform="translate(1188 446)">
        <path
          d="M0 232 C 10 176, 28 126, 52 74 C 76 30, 88 6, 103 -22"
          fill="none"
          stroke={colors.foliageDeep}
          strokeLinecap="round"
          strokeWidth="4"
        />
        {[
          [40, 138, 80, 34, -26],
          [63, 92, 84, 36, -15],
          [88, 50, 72, 30, -8],
          [16, 176, 68, 26, -38],
        ].map(([x, y, width, height, rotate], index) => (
          <ellipse
            cx={x}
            cy={y}
            fill="none"
            key={`portrait-leaf-${index}`}
            rx={width / 2}
            ry={height / 2}
            stroke={colors.foliage}
            strokeWidth="4"
            transform={`rotate(${rotate} ${x} ${y})`}
          />
        ))}
      </g>
      <g opacity="0.4">
        {Array.from({ length: 16 }).map((_, index) => (
          <circle
            cx={1260 + (index % 4) * 34}
            cy={170 + Math.floor(index / 4) * 34}
            fill={colors.foliageDeep}
            key={`portrait-dot-${index}`}
            r="2.6"
          />
        ))}
      </g>
    </>
  );
}

export default function ProjectVisual({ theme = 'terrace', title, variant = 'hero' }) {
  const colorSet = themeMap[theme] ?? themeMap.terrace;
  const gradientId = useId().replace(/:/g, '-');

  return (
    <svg
      aria-label={title}
      className="project-visual"
      role="img"
      viewBox="0 0 1600 1000"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {variant === 'plan' ? <PlanVariant colors={colorSet} /> : null}
      {variant === 'section' ? (
        <SectionVariant colors={colorSet} config={colorSet} />
      ) : null}
      {variant === 'detail' ? <DetailVariant colors={colorSet} /> : null}
      {variant === 'study' ? (
        <StudyVariant colors={colorSet} gradientId={gradientId} />
      ) : null}
      {variant === 'portrait' ? (
        <PortraitVariant colors={colorSet} gradientId={gradientId} />
      ) : null}
      {(variant === 'hero' || variant === 'card') ? (
        <ScenicVariant colors={colorSet} config={colorSet} gradientId={gradientId} />
      ) : null}
    </svg>
  );
}
