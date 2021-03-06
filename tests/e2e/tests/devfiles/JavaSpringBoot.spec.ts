/*********************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
import 'reflect-metadata';
import { WorkspaceNameHandler } from '../..';
import * as projectAndFileTests from '../../testsLibrary/ProjectAndFileTests';
import * as commonLsTests from '../../testsLibrary/LsTests';
import * as workspaceHandling from '../../testsLibrary/WorkspaceHandlingTests';
import * as codeExecutionTests from '../../testsLibrary/CodeExecutionTests';

const stack: string = 'Java Spring Boot';
const workspaceSampleName: string = 'java-web-spring';
const workspaceRootFolderName: string = 'src';
const fileFolderPath: string = `${workspaceSampleName}/${workspaceRootFolderName}/main/java/org/springframework/samples/petclinic`;
const tabTitle: string = 'PetClinicApplication.java';
const codeNavigationClassName: string = 'SpringApplication.class';
const buildTaskName: string = 'maven build';
const runTaskName: string = 'run webapp';
const runTaskExpectedDialogue: string = 'Process 8080-tcp is now listening on port 8080. Open it ?';

suite(`${stack} test`, async () => {
    suite(`Create ${stack} workspace`, async () => {
        workspaceHandling.createAndOpenWorkspace(stack);
        projectAndFileTests.waitWorkspaceReadiness(workspaceSampleName, workspaceRootFolderName);
    });

    suite('Test opening file', async () => {
        // opening file that soon should give time for LS to initialize
        projectAndFileTests.openFile(fileFolderPath, tabTitle);
    });

    suite('Validation of workspace build', async () => {
        codeExecutionTests.runTask(buildTaskName, 420_000);
        codeExecutionTests.closeTerminal(buildTaskName);
    });

    suite('Validation of workspace execution', async () => {
        codeExecutionTests.runTaskWithNotification(runTaskName, runTaskExpectedDialogue, 120_000);
        codeExecutionTests.closeTerminal(runTaskName);
    });

    suite('Language server validation', async () => {
        commonLsTests.autocomplete(tabTitle, 32, 56, 'args : String[]');
        commonLsTests.errorHighlighting(tabTitle, 'error_text', 30);
        commonLsTests.codeNavigation(tabTitle, 32, 23, codeNavigationClassName);
        commonLsTests.suggestionInvoking(tabTitle, 32, 23, 'run(Class<?>');
    });

    suite('Stopping and deleting the workspace', async () => {
        let workspaceName = 'not defined';
        suiteSetup(async () => {
            workspaceName = await WorkspaceNameHandler.getNameFromUrl();
        });

        test(`Stop and remowe workspace`, async () => {
            await workspaceHandling.stopAndRemoveWorkspace(workspaceName);
        });
    });
});
