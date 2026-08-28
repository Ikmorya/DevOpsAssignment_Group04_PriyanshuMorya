import subprocess
from collections import defaultdict
import datetime
import io
import os
import sys
import html
import matplotlib.pyplot as plt


from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


# -------------------------------------------------------------
# CONFIGURATION: Institution & Department Details
# -------------------------------------------------------------
COLLEGE_NAME = "Swami Keshvanand Institute of Technology, Management & Gramothan, Jaipur"
DEPARTMENT_NAME = "Department of Computer Science & Engineering"
# -------------------------------------------------------------


def get_repo_info():
    """Extracts the repository name and current branch."""
    repo_name = "Project-Repository"
    branch_name = "main"


    try:
        root_path = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], encoding='utf-8').strip()
        repo_name = os.path.basename(root_path)
    except Exception:
        try:
            remote_url = subprocess.check_output(['git', 'config', '--get', 'remote.origin.url'], encoding='utf-8').strip()
            repo_name = remote_url.rstrip('/').split('/')[-1].replace('.git', '')
        except Exception:
            repo_name = os.path.basename(os.getcwd())


    try:
        branch_name = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], encoding='utf-8').strip()
    except Exception:
        pass


    return repo_name, branch_name


def get_git_metrics(interval="weekly"):
    """
    Parses Git commit logs and aggregates metrics.
    Supported intervals: 'weekly', 'monthly', 'final'
    """
    today = datetime.date.today()
    git_args = ['git', 'log', '--no-merges', '--pretty=format:COMMIT|||%h|||%an|||%ad|||%s', '--date=short', '--numstat']
    
    if interval == "weekly":
        since_date = (today - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
        git_args.append(f"--since={since_date}")
        scope_title = f"Last 7 Days (Since {since_date})"
    elif interval == "monthly":
        since_date = (today - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
        git_args.append(f"--since={since_date}")
        scope_title = f"Last 30 Days (Since {since_date})"
    else:
        scope_title = "Complete Project Lifecycle (All Commits)"


    try:
        raw_output = subprocess.check_output(git_args, encoding='utf-8', errors='replace')
    except subprocess.CalledProcessError:
        print("[ERROR] Git command failed. Please ensure you are inside a Git repository.")
        return None, None, None, scope_title


    students = defaultdict(lambda: {"commits": 0, "added": 0, "deleted": 0, "active_days": set()})
    timeline_activity = defaultdict(lambda: defaultdict(int))
    student_logs = defaultdict(list)


    current_author = None
    current_date_str = None


    for line in raw_output.strip().split('\n'):
        line = line.strip()
        if not line:
            continue
            
        if line.startswith('COMMIT|||'):
            parts = line.split('|||')
            if len(parts) >= 5:
                sha = parts[1].strip()
                author = parts[2].strip()
                date_str = parts[3].strip()
                msg = parts[4].strip()
            else:
                continue
            
            # Exclude bot commi