import os
import sys
import json
import argparse
import numpy as np

from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense
from tensorflow.keras.preprocessing import image as kimage


# =====================================================
# MODEL CONFIGURATION
# =====================================================

IMG_SIZE = (256, 256)

NUM_CLASSES = 8


# IMPORTANT:
# This mapping must exactly match training.

DEFAULT_LABELS = {

    0: "A+",
    1: "A-",
    2: "AB+",
    3: "AB-",
    4: "B+",
    5: "B-",
    6: "O+",
    7: "O-"

}


# =====================================================
# BUILD MODEL
# =====================================================

def build_model(
    num_classes=NUM_CLASSES
):

    base = ResNet50(

        input_shape=(
            *IMG_SIZE,
            3
        ),

        include_top=False,

        weights=None,

        pooling="avg"

    )


    x = Dense(
        128,
        activation="relu"
    )(base.output)


    x = Dense(
        128,
        activation="relu"
    )(x)


    outputs = Dense(
        num_classes,
        activation="softmax"
    )(x)


    model = Model(

        inputs=base.input,

        outputs=outputs

    )


    return model


# =====================================================
# PREDICTION FUNCTION
# =====================================================

def predict_blood_group(

    weights_path,

    image_path,

    labels=DEFAULT_LABELS

):


    # -------------------------------------------------
    # CHECK WEIGHTS
    # -------------------------------------------------

    if not os.path.exists(
        weights_path
    ):

        raise FileNotFoundError(

            f"Weights file not found: "
            f"{weights_path}"

        )


    # -------------------------------------------------
    # CHECK IMAGE
    # -------------------------------------------------

    if not os.path.exists(
        image_path
    ):

        raise FileNotFoundError(

            f"Image file not found: "
            f"{image_path}"

        )


    # -------------------------------------------------
    # BUILD MODEL
    # -------------------------------------------------

    model = build_model(

        num_classes=len(
            labels
        )

    )


    # -------------------------------------------------
    # LOAD TRAINED WEIGHTS
    # -------------------------------------------------

    model.load_weights(
        weights_path
    )


    # -------------------------------------------------
    # LOAD IMAGE
    # -------------------------------------------------

    img = kimage.load_img(

        image_path,

        target_size=IMG_SIZE

    )


    # -------------------------------------------------
    # IMAGE → NUMPY ARRAY
    # -------------------------------------------------

    x = kimage.img_to_array(
        img
    )


    # -------------------------------------------------
    # ADD BATCH DIMENSION
    # -------------------------------------------------

    x = np.expand_dims(
        x,
        axis=0
    )


    # -------------------------------------------------
    # RESNET PREPROCESSING
    # -------------------------------------------------

    x = preprocess_input(
        x
    )


    # -------------------------------------------------
    # MODEL PREDICTION
    # -------------------------------------------------

    probs = model.predict(

        x,

        verbose=0

    )[0]


    # -------------------------------------------------
    # FIND HIGHEST PROBABILITY CLASS
    # -------------------------------------------------

    pred_idx = int(
        np.argmax(probs)
    )


    # -------------------------------------------------
    # CONVERT INDEX → BLOOD GROUP
    # -------------------------------------------------

    pred_label = labels[
        pred_idx
    ]


    # -------------------------------------------------
    # CONFIDENCE
    # -------------------------------------------------

    confidence = (

        float(
            probs[pred_idx]
        )

        * 100

    )


    # -------------------------------------------------
    # ALL CLASS PROBABILITIES
    # -------------------------------------------------

    probabilities = {}


    for i, label in labels.items():

        probabilities[label] = round(

            float(
                probs[i]
            ) * 100,

            2

        )


    # -------------------------------------------------
    # RETURN RESULT
    # -------------------------------------------------

    return {

        "prediction":
            pred_label,

        "confidence":
            round(
                confidence,
                2
            ),

        "probabilities":
            probabilities

    }


# =====================================================
# MAIN
# =====================================================

if __name__ == "__main__":

    parser = argparse.ArgumentParser()


    parser.add_argument(

        "--weights",

        type=str,

        required=True

    )


    parser.add_argument(

        "--image",

        type=str,

        required=True

    )


    args = parser.parse_args()


    try:

        result = predict_blood_group(

            args.weights,

            args.image

        )


        # VERY IMPORTANT:
        #
        # Print ONLY JSON.
        #
        # Node.js will read this output.

        print(
            json.dumps(
                result
            )
        )


    except Exception as error:

        # Return error as JSON

        print(

            json.dumps({

                "error":
                    str(error)

            })

        )


        sys.exit(1)