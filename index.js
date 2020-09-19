'use strict';

const core = require('@actions/core');
const github = require('@actions/github');
const pinnedIssues = require('octokit-pinned-issues');

async function run() {
  try {
    const limit_group = core.getInput('limit-group');
    on_vacation = false;

    const myOctokit = github.GitHub.plugin(pinnedIssues);
    const octokit = new myOctokit(core.getInput('personal-access-token'))

    // Get pinned issues
    const { data: issues } = await octokit.getPinnedIssues({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
    });

    for (let issue of issues) {
      if (issue.state == "open" && issue.title.toLowerCase().includes('vacation')) {
        on_vacation = true;
        break;
      }
    }

    // Always remove repo interaction restrictions first in order to reset the interaction limit 24 hour timer
    await octokit.interactions.removeRestrictionsForRepo({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      mediaType: {
        previews: [
          'sombra'
        ],
      },
    });

    if (on_vacation) {
      console.log("🌴 Enjoy your vacation!");

      // Set repo interaction restrictions
      await octokit.interactions.setRestrictionsForRepo({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        mediaType: {
          previews: [
            'sombra'
          ],
        },
        limit: limit_group,
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();