from io import BytesIO
from urllib.request import urlopen
from zipfile import ZipFile
import argparse
import os
import sys

SUCCESS_COLOR = "\033[92m"
ERROR_COLOR = "\033[91m"
END_COLOR = "\033[0m"
USER_HOME_DIR = "./"

UNANSWERED_FORMAT = "_fellow"
REVIEW_MODULE_FORMAT = "_review_module"
TRAINING_CASES_ZIP_URL = (
    "https://training-cases.s3.us-east-2.amazonaws.com/cases/{}.zip?latest=true"
)

# Parser Setup
parser = argparse.ArgumentParser()
parser.add_argument(
    "case_name",
    help="the name of the case you want to download",
)
parser.add_argument(
    "-a",
    "--answer",
    dest="answer_variant",
    action="store_const",
    const=True,
    default=False,
    help="Download the answer key version of the specified case. Use with -r for the answered review module",
)
parser.add_argument(
    "-r",
    "--review_module",
    dest="review_module_variant",
    action="store_const",
    const=True,
    default=False,
    help="Download the review module version of the specified case.",
)
parser.add_argument(
    "-f",
    "--force",
    dest="overwrite",
    action="store_const",
    const=True,
    default=False,
    help="Overwrite your existing case download, restoring it to its original state. This will revert work you have done in your notebooks!",
)


def download_case(case_name):
    zip_url = TRAINING_CASES_ZIP_URL.format(case_name)
    try:
        with urlopen(zip_url) as zipresp:
            with ZipFile(BytesIO(zipresp.read())) as zfile:
                zfile.extractall(USER_HOME_DIR)
    except Exception:
        error = f"{ERROR_COLOR}Error:{END_COLOR} Could not download {case_name}."
        error = f"{error}\nDouble check the spelling of your case name."
        if args.answer_variant:
            error = f"{error}\nIt is possible that the answer key version of the requested case has not been released yet, or will never be."
        elif args.review_module_variant:
            error = f"{error}\nIt is possible that the review module version of the requested case has not been released yet, or will never be."
        print(error, file=sys.stderr)
        sys.exit(1)
    print(f"{SUCCESS_COLOR}Success!{END_COLOR} {case_name} successfully downloaded")


if __name__ == "__main__":
    # Parse and handle arguments
    args = parser.parse_args()

    case_name = args.case_name
    if args.review_module_variant:
        case_name = f"{case_name}{REVIEW_MODULE_FORMAT}"
    if not args.answer_variant:
        case_name = f"{case_name}{UNANSWERED_FORMAT}"

    # Error out instead of overwriting existing case, unless we set -f
    if os.path.isdir(os.path.join(USER_HOME_DIR, case_name)) and not args.overwrite:
        print(
            f"{ERROR_COLOR}Error:{END_COLOR} Directory {case_name} already exists, downloading it again will overwrite changes you have made.",
            file=sys.stderr,
        )
        print(
            "If you want to restore it to its original state, pass -f as an argument",
            file=sys.stderr,
        )
        sys.exit(1)
    download_case(case_name)
