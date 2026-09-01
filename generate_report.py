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
            
            # Exclude bot commits from metric calculations
            if "bot" in author.lower() or "github-actions" in author.lower():
                current_author = None
                continue
            
            current_author = author
            current_date_str = date_str
            
            students[current_author]["commits"] += 1
            students[current_author]["active_days"].add(current_date_str)
            student_logs[current_author].append((date_str, sha, msg))
            
            try:
                dt = datetime.datetime.strptime(current_date_str, "%Y-%m-%d").date()
                if interval == "weekly":
                    period_key = dt.strftime("%a (%b %d)")
                elif interval == "monthly":
                    period_key = f"{dt.isocalendar()[0]}-W{dt.isocalendar()[1]:02d}"
                else:
                    period_key = dt.strftime("%Y-%m")
                timeline_activity[period_key][current_author] += 1
            except Exception:
                pass


        elif current_author and not line.startswith('COMMIT|||'):
            parts = line.split()
            if len(parts) >= 2 and parts[0].isdigit() and parts[1].isdigit():
                students[current_author]["added"] += int(parts[0])
                students[current_author]["deleted"] += int(parts[1])


    return students, timeline_activity, student_logs, scope_title


def create_charts(students, timeline_activity, interval):
    """Generates workload distribution and timeline comparison charts."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 3.8))
    authors = list(students.keys())
    periods = sorted(timeline_activity.keys())


    # 1. Timeline Chart
    if periods and authors:
        for author in authors:
            counts = [timeline_activity[p].get(author, 0) for p in periods]
            ax1.plot(periods, counts, marker='o', linewidth=2, label=author)
        ax1.set_title(f"Commit Timeline ({interval.capitalize()})", fontsize=10, fontweight='bold')
        ax1.set_ylabel("Commits")
        ax1.tick_params(axis='x', rotation=30)
        ax1.grid(True, linestyle='--', alpha=0.5)
        ax1.legend(fontsize=8)
    else:
        ax1.text(0.5, 0.5, "No commits found in this interval", ha='center', va='center')


    # 2. Net LOC Chart
    if authors:
        net_loc = [students[a]["added"] - students[a]["deleted"] for a in authors]
        colors_list = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F']
        ax2.bar(authors, net_loc, color=colors_list[:len(authors)], width=0.45)
        ax2.set_title("Net Lines of Code Written", fontsize=10, fontweight='bold')
        ax2.set_ylabel("LOC (Added - Deleted)")
        ax2.grid(axis='y', linestyle='--', alpha=0.5)
    else:
        ax2.text(0.5, 0.5, "No LOC changes recorded", ha='center', va='center')


    plt.tight_layout()
    img_buffer = io.BytesIO()
    plt.savefig(img_buffer, format='png', dpi=200)
    plt.close()
    img_buffer.seek(0)
    return Image(img_buffer, width=500, height=170)


def generate_pdf(interval="weekly"):
    repo_name, branch_name = get_repo_info()
    students, timeline_activity, student_logs, scope_title = get_git_metrics(interval)


    if students is None:
        return


    date_stamp = datetime.date.today().strftime("%Y-%m-%d")
    
    if interval == "weekly":
        report_title = "Weekly Progress Report"
        doc_name = f"{repo_name}_Weekly_Progress_Report_Form-3_{date_stamp}.pdf"
    elif interval == "monthly":
        re