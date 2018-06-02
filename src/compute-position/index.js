import rotation from "./rotation";

const coordinatesMap = {
  "top-left": [0, 0],
  top: [0.5, 0],
  "top-right": [1, 0],
  left: [0, 0.5],
  center: [0.5, 0.5],
  right: [1, 0.5],
  "bottom-left": [0, 1],
  bottom: [0.5, 1],
  "bottom-right": [1, 1]
};

function computePixelCoordinates({ coordinates, boundingBox }) {
  let left, top;

  const x = coordinates[0];
  const y = coordinates[1];

  if (typeof x === "string") {
    let numericLeft;
    if (x.includes("px")) {
      numericLeft = Number(x.replace("px", ""));
    } else if (x.includes("%")) {
      numericLeft = Number(x.replace("%", "")) * boundingBox.width / 100;
    } else {
      numericLeft = Number(x);
    }

    left = Number.isNaN(numericLeft) ? 0 : numericLeft;
  } else if (typeof x === "number") {
    left = Number.isNaN(x) ? 0 : x * boundingBox.width;
  }

  if (typeof y === "string") {
    let numericTop;

    if (y.includes("px")) {
      numericTop = Number(y.replace("px", ""));
    } else if (y.includes("%")) {
      numericTop = Number(y.replace("%", "")) * boundingBox.height / 100;
    } else {
      numericTop = Number(y);
    }

    top = Number.isNaN(numericTop) ? 0 : numericTop;
  } else if (typeof y === "number") {
    top = Number.isNaN(y) ? 0 : y * boundingBox.height;
  }

  return {
    left,
    top
  };
}

function getDefaultOriginFromRotatedCoordinates({ x, y }) {
  if (x > 0 && y > 0) {
    return "bottom";
  } else if (x < 0 && y > 0) {
    return "right";
  } else if (x < 0 && y < 0) {
    return "top";
  } else if (x > 0 && y < 0) {
    return "left";
  } else if (x > 0 && y === 0) {
    return "top-left";
  } else if (x < 0 && y === 0) {
    return "top-left";
  } else if (x === 0 && y > 0) {
    return "top-right";
  } else if (x === 0 && y < 0) {
    return "top-right";
  } else if (x === 0 && y === 0) {
    return "center";
  }

  // I don't think this will ever happen, but just in case.
  return "top-left";
}

function getFirstResolutionAxisFromRotatedCoordinates({ x, y }) {
  if (x > 0 && y > 0) {
    return "y";
  } else if (x < 0 && y > 0) {
    return "x";
  } else if (x < 0 && y < 0) {
    return "y";
  } else if (x > 0 && y < 0) {
    return "x";
  } else if (x > 0 && y === 0) {
    return "y";
  } else if (x < 0 && y === 0) {
    return "y";
  } else if (x === 0 && y > 0) {
    return "y";
  } else if (x === 0 && y < 0) {
    return "y";
  } else if (x === 0 && y === 0) {
    return "y";
  }

  // I don't think this will ever happen, but just in case.
  return "x";
}

function clamp(min, val, max) {
  return Math.min(Math.max(min, val), max);
}

function skipBoundary({ val, boundaryStart, boundaryEnd, goHigher = true }) {
  const isBetween = val > boundaryStart && val < boundaryEnd;

  if (isBetween) {
    return goHigher ? boundaryEnd : boundaryStart;
  } else {
    return val;
  }
}

function dimensionsOverlap({ leftOne, rightOne, leftTwo, rightTwo }) {
  const overlap = rightOne > leftTwo && rightTwo > leftOne;

  return overlap;
}

export default function computePosition({
  targetBoundingBox,
  overBoundingBox,
  position,
  origin,
  config
}) {
  const { allowOverlap } = config;

  if (!position) {
    position = "top";
  } else if (typeof position === "string") {
    position = position.toLowerCase();
  }

  let positionCoordinates;
  if (Array.isArray(position)) {
    positionCoordinates = position;
  } else if (typeof position === "string") {
    positionCoordinates = coordinatesMap[position];
  }

  positionCoordinates = positionCoordinates || coordinatesMap["top-left"];

  // The relative anchor point is the anchor point relative to the trigger element
  // (0, 0) in this coordinate system is the top-left of the trigger element
  const relativeAnchorPoint = computePixelCoordinates({
    coordinates: positionCoordinates,
    boundingBox: targetBoundingBox
  });

  const absoluteAnchorPoint = {
    left: relativeAnchorPoint.left + targetBoundingBox.left,
    top: relativeAnchorPoint.top + targetBoundingBox.top
  };

  let transformedCoordinates;

  if (!origin) {
    transformedCoordinates = rotation({
      position: relativeAnchorPoint,
      boundingBox: targetBoundingBox
    });

    origin = getDefaultOriginFromRotatedCoordinates(transformedCoordinates);
  } else if (typeof origin === "string") {
    origin = origin.toLowerCase();
  }

  let originCoordinates;
  if (Array.isArray(origin)) {
    originCoordinates = origin;
  } else if (typeof origin === "string") {
    originCoordinates = coordinatesMap[origin];
  }

  originCoordinates = originCoordinates || coordinatesMap["top-left"];

  const originAdjustment = computePixelCoordinates({
    coordinates: originCoordinates,
    boundingBox: overBoundingBox
  });

  // These coordinates are where it would be if there was no bottom or
  // right boundary to the viewport. But there are, so we may not use these.
  const computedLeft = absoluteAnchorPoint.left - originAdjustment.left;
  const computedTop = absoluteAnchorPoint.top - originAdjustment.top;

  // These are the furthest to the left and top that the element can go
  // without extending beyond the viewport in that direction.
  const maxLeft = window.innerWidth - overBoundingBox.width;
  const maxTop = window.innerHeight - overBoundingBox.height;

  const clampedLeft = clamp(0, computedLeft, maxLeft);
  const clampedTop = clamp(0, computedTop, maxTop);

  let top, left;
  if (allowOverlap) {
    top = clampedTop;
    left = clampedLeft;
  } else {
    transformedCoordinates =
      transformedCoordinates ||
      rotation({
        position: relativeAnchorPoint,
        boundingBox: targetBoundingBox
      });

    const axisToResolveFirst = getFirstResolutionAxisFromRotatedCoordinates(
      transformedCoordinates
    );

    const yAxisFirst = axisToResolveFirst === "y";

    const firstLeftOne = yAxisFirst
      ? targetBoundingBox.left
      : targetBoundingBox.top;
    const firstRightOne = yAxisFirst
      ? targetBoundingBox.right
      : targetBoundingBox.bottom;
    const firstLeftTwo = yAxisFirst ? clampedLeft : clampedTop;
    const firstRightTwo = yAxisFirst
      ? clampedLeft + overBoundingBox.width
      : clampedTop + overBoundingBox.height;

    const overlapFirstDim = dimensionsOverlap({
      leftOne: firstLeftOne,
      rightOne: firstRightOne,
      leftTwo: firstLeftTwo,
      rightTwo: firstRightTwo
    });

    if (overlapFirstDim) {
      let firstDimStartBoundary;
      let firstDimEndBoundary;

      if (yAxisFirst) {
        firstDimStartBoundary = targetBoundingBox.top - overBoundingBox.height;
        firstDimEndBoundary = targetBoundingBox.top + targetBoundingBox.height;
      } else {
        firstDimStartBoundary = targetBoundingBox.left - overBoundingBox.width;
        firstDimEndBoundary = targetBoundingBox.left + targetBoundingBox.width;
      }

      const firstDimSkippedValue = skipBoundary({
        val: yAxisFirst ? clampedTop : clampedLeft,
        boundaryStart: firstDimStartBoundary,
        boundaryEnd: firstDimEndBoundary,
        goHigher: true
      });

      if (yAxisFirst) {
        top = firstDimSkippedValue;
      } else {
        left = firstDimSkippedValue;
      }
    } else {
      if (yAxisFirst) {
        top = clampedTop;
      } else {
        left = clampedLeft;
      }
    }

    const secondLeftOne = yAxisFirst
      ? targetBoundingBox.top
      : targetBoundingBox.left;
    const secondRightOne = yAxisFirst
      ? targetBoundingBox.bottom
      : targetBoundingBox.right;

    const secondLeftTwo = yAxisFirst ? top : left;
    const secondRightTwo = yAxisFirst
      ? top + overBoundingBox.height
      : left + overBoundingBox.width;

    const overlapSecondDim = dimensionsOverlap({
      leftOne: secondLeftOne,
      rightOne: secondRightOne,
      leftTwo: secondLeftTwo,
      rightTwo: secondRightTwo
    });

    if (overlapSecondDim) {
      let secondDimStartBoundary;
      let secondDimEndBoundary;

      if (yAxisFirst) {
        secondDimStartBoundary = targetBoundingBox.left - overBoundingBox.width;
        secondDimEndBoundary = targetBoundingBox.left + targetBoundingBox.width;
      } else {
        secondDimStartBoundary = targetBoundingBox.top - overBoundingBox.height;
        secondDimEndBoundary = targetBoundingBox.top + targetBoundingBox.height;
      }

      const secondDimSkippedValue = skipBoundary({
        val: yAxisFirst ? clampedLeft : clampedTop,
        boundaryStart: secondDimStartBoundary,
        boundaryEnd: secondDimEndBoundary,
        goHigher: true
      });

      if (yAxisFirst) {
        left = secondDimSkippedValue;
      } else {
        top = secondDimSkippedValue;
      }
    } else {
      if (yAxisFirst) {
        left = clampedLeft;
      } else {
        top = clampedTop;
      }
    }
  }

  if (position === "bottom") {
    let topPos = targetBoundingBox.top + targetBoundingBox.height;
    let topEndPos = topPos + overBoundingBox.height;
    let pointerTop = 0;
    let pointerLeft = overBoundingBox.width / 2;
    let pointerRotation = 180;

    if (topEndPos > window.scrollY + window.innerHeight) {
      topPos = targetBoundingBox.top - overBoundingBox.height;
      pointerTop = overBoundingBox.height;
      pointerRotation = 0;
    }

    return {
      top,
      left,
      pointerTop,
      pointerLeft,
      pointerRotation
    };
  }

  if (position === "right") {
    let leftPos = targetBoundingBox.left + targetBoundingBox.width;
    let leftEndPos = leftPos + overBoundingBox.width;
    let pointerTop = overBoundingBox.height / 2;
    let pointerLeft = 0;
    let pointerRotation = 90;

    if (leftEndPos > window.innerWidth) {
      leftPos = targetBoundingBox.left - overBoundingBox.width;
      pointerLeft = overBoundingBox.width;
      pointerRotation = -90;
    }

    return {
      top,
      left,
      pointerLeft,
      pointerTop,
      pointerRotation
    };
  }

  if (position === "left") {
    let leftPos = targetBoundingBox.left - overBoundingBox.width;
    let pointerTop = overBoundingBox.height / 2;
    let pointerLeft = overBoundingBox.width;
    let pointerRotation = -90;

    if (leftPos < 0) {
      leftPos = targetBoundingBox.left + targetBoundingBox.width;
      pointerLeft = 0;
      pointerRotation = 90;
    }

    return {
      top,
      left,
      pointerTop,
      pointerLeft,
      pointerRotation
    };
  }

  if (position === "center") {
    return {
      top,
      left,
      pointerOpacity: 0
    };
  }

  let topPos = targetBoundingBox.top - overBoundingBox.height;
  let pointerTop = overBoundingBox.height;
  let pointerLeft = overBoundingBox.width / 2;
  let pointerRotation = 0;

  if (topPos < window.scrollY) {
    topPos = targetBoundingBox.top + targetBoundingBox.height;
    pointerTop = 0;
    pointerRotation = 180;
  }

  return {
    top,
    left,
    pointerTop,
    pointerLeft,
    pointerRotation,
    relativeAnchorPoint,
    absoluteAnchorPoint
  };
}
